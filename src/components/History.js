import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiImage, FiHeart, FiDownload, FiTrash2, FiX } from 'react-icons/fi';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { historyAPI } from './api';
import ParticlesBackground from './ParticlesBackground';
import '../css/Dashboard.scss';

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const fetchHistory = async () => {
    try {
      const res = await historyAPI.getHistory();
      setImages(res.data.data.images || []);
    } catch (err) {
      toast.error('Failed to load your history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleFavorite = async (e, img) => {
    e.stopPropagation();
    try {
      await historyAPI.toggleFavorite(img._id);
      setImages(prev => prev.map(item =>
        item._id === img._id ? { ...item, isFavorite: !item.isFavorite } : item
      ));
      if (selectedImage && selectedImage._id === img._id) {
        setSelectedImage(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
      }
      toast.success(img.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleDelete = async (e, img) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await historyAPI.deleteImage(img._id);
      setImages(prev => prev.filter(item => item._id !== img._id));
      if (selectedImage && selectedImage._id === img._id) {
        setSelectedImage(null);
      }
      toast.success('Image deleted');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const handleDownload = (e, img) => {
    e.stopPropagation();
    try {
      toast.loading('Preparing download...', { id: 'download-toast' });
      const url = img.enhancedUrl || img.originalUrl;
      const filename = url.substring(url.lastIndexOf('/') + 1);
      window.location.href = `/api/images/download?filename=${filename}`;
      toast.success('Download started!', { id: 'download-toast' });
    } catch (err) {
      console.error('Failed to download image', err);
      window.open(img.enhancedUrl || img.originalUrl, '_blank');
      toast.success('Opening in new tab (right-click to save)', { id: 'download-toast' });
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 160px)', background: 'var(--bg-primary)' }}>
        <div className="spinner-gradient" />
      </div>
    );
  }

  return (
    <div className="history-page">
      <ParticlesBackground />
      <div className="dashboard-orbs">
        <div className="orb orb-purple" style={{ top: '15%', left: '10%' }} />
        <div className="orb orb-cyan" style={{ bottom: '15%', right: '10%' }} />
      </div>

      <div className="history-container">
        {/* Header */}
        <div className="history-header">
          <div>
            <h1>My Creations</h1>
            <p>View, download, and manage your generated and enhanced AI images.</p>
          </div>
          <button className="btn-glass" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        {/* Gallery */}
        {loading ? (
          <div className="flex-center" style={{ padding: '5rem' }}>
            <div className="spinner-gradient sm" />
          </div>
        ) : images.length > 0 ? (
          <div className="history-section">
            <div className="gallery-grid">
              {images.map((img) => (
                <div key={img._id} className="gallery-item" onClick={() => setSelectedImage(img)}>
                  <img src={img.enhancedUrl || img.originalUrl} alt={img.prompt || 'Creation'} />
                  <div className="item-overlay">
                    <p className="item-prompt">{img.prompt || 'Upscaled Image'}</p>
                    <div className="item-actions">
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className={`action-btn favorite-btn ${img.isFavorite ? 'active' : ''}`}
                          onClick={(e) => handleFavorite(e, img)}
                        >
                          <FiHeart size={14} fill={img.isFavorite ? 'var(--accent-pink)' : 'none'} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={(e) => handleDelete(e, img)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                      <span className="badge-glass">{img.upscaleLevel || 'SDXL'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="history-section">
            <div className="gallery-empty glass-card">
              <div className="empty-icon"><FiImage /></div>
              <h4>Gallery is empty</h4>
              <p>You haven't generated or upscaled any images yet.</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button className="btn-primary-gradient" onClick={() => navigate('/generate')}>
                  Generate
                </button>
                <button className="btn-glass" onClick={() => navigate('/upscaler')}>
                  Upscale
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compare Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
              <FiX size={18} />
            </button>

            {/* slider compare if it has enhanced and original separate, else single image */}
            {selectedImage.originalUrl && selectedImage.enhancedUrl && selectedImage.originalUrl !== selectedImage.enhancedUrl ? (
              <div className="modal-compare-slider">
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={selectedImage.originalUrl} alt="Original" />}
                  itemTwo={<ReactCompareSliderImage src={selectedImage.enhancedUrl} alt="Enhanced" />}
                  style={{ maxHeight: '60vh' }}
                />
              </div>
            ) : (
              <div className="modal-compare-slider">
                <img src={selectedImage.enhancedUrl || selectedImage.originalUrl} alt="Creation" />
              </div>
            )}

            <div className="modal-meta glass-card">
              <div className="meta-header">
                <div className="meta-details">
                  <span className="meta-title">Image Details</span>
                  <p className="meta-prompt">{selectedImage.prompt || 'AI Enhanced Image'}</p>
                </div>
                <div className="meta-badges">
                  {selectedImage.upscaleLevel && <span className="badge-glass">{selectedImage.upscaleLevel} Enhanced</span>}
                  <span className="badge-glass">{selectedImage.type}</span>
                </div>
              </div>

              <div className="meta-actions">
                <button className="btn-primary-gradient" onClick={(e) => handleDownload(e, selectedImage)}>
                  <FiDownload /> Download Image
                </button>
                <button
                  className={`btn-glass ${selectedImage.isFavorite ? 'active' : ''}`}
                  onClick={(e) => handleFavorite(e, selectedImage)}
                  style={{ color: selectedImage.isFavorite ? 'var(--accent-pink)' : 'inherit' }}
                >
                  <FiHeart fill={selectedImage.isFavorite ? 'var(--accent-pink)' : 'none'} />
                  {selectedImage.isFavorite ? 'Favorited' : 'Favorite'}
                </button>
                <button className="btn-glass" onClick={(e) => handleDelete(e, selectedImage)}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
