import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiZap, FiCpu, FiTrendingUp, FiArrowRight, FiClock, FiImage, FiHeart } from 'react-icons/fi';
import { useAuth } from './AuthContext';
import { historyAPI } from './api';
import ParticlesBackground from './ParticlesBackground';
import '../css/Dashboard.scss';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [recentImages, setRecentImages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchRecentHistory = async () => {
      if (!user) return;
      try {
        const res = await historyAPI.getHistory({ limit: 4 });
        setRecentImages(res.data.data.images || []);
      } catch (err) {
        console.error('Failed to fetch recent history', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchRecentHistory();
  }, [user]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 160px)', background: 'var(--bg-primary)' }}>
        <div className="spinner-gradient" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <ParticlesBackground />
      <div className="dashboard-orbs">
        <div className="orb orb-purple" style={{ top: '10%', left: '5%' }} />
        <div className="orb orb-cyan" style={{ bottom: '10%', right: '5%' }} />
      </div>

      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user.name}</h1>
            <p>Monitor your credits, view recent generations, and run AI tools.</p>
          </div>
          <Link to="/history" className="btn-glass">
            <FiClock /> View Full History
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon credits"><FiZap /></div>
            <div className="stat-info">
              <span className="stat-val">{user.credits}</span>
              <span className="stat-label">Credits Remaining</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon generations"><FiCpu /></div>
            <div className="stat-info">
              <span className="stat-val">{user.totalGenerated || 0}</span>
              <span className="stat-label">Total Generated</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon upscales"><FiTrendingUp /></div>
            <div className="stat-info">
              <span className="stat-val">{user.totalUpscaled || 0}</span>
              <span className="stat-label">Total Upscaled</span>
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="actions-section">
          <h3>Create & Enhance</h3>
          <div className="actions-grid">
            <div className="action-card glass-card" onClick={() => navigate('/generate')}>
              <div className="action-icon"><FiCpu /></div>
              <h4>AI Image Generator</h4>
              <p>Create photorealistic images from textual descriptions using Stable Diffusion XL with instant rendering.</p>
              <span className="action-link">Open Generator <FiArrowRight /></span>
            </div>
            <div className="action-card glass-card" onClick={() => navigate('/upscaler')}>
              <div className="action-icon"><FiTrendingUp /></div>
              <h4>AI Image Upscaler</h4>
              <p>Upscale low-resolution photos to crisp, professional-grade HD, 2K, 4K, or 8K outputs without losing detail.</p>
              <span className="action-link">Open Upscaler <FiArrowRight /></span>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="history-section">
          <div className="history-section-header">
            <h3>Recent Items</h3>
            {recentImages.length > 0 && (
              <Link to="/history" className="action-link" style={{ textDecoration: 'none' }}>
                View All <FiArrowRight />
              </Link>
            )}
          </div>

          {loadingHistory ? (
            <div className="flex-center" style={{ padding: '3rem' }}>
              <div className="spinner-gradient sm" />
            </div>
          ) : recentImages.length > 0 ? (
            <div className="gallery-grid">
              {recentImages.map((img) => (
                <div key={img._id} className="gallery-item" onClick={() => navigate('/history')}>
                  <img src={img.enhancedUrl || img.originalUrl} alt={img.prompt || 'Recent upscale'} />
                  <div className="item-overlay">
                    <p className="item-prompt">{img.prompt || 'Upscaled Image'}</p>
                    <div className="item-actions">
                      <span className="badge-glass">{img.upscaleLevel || 'SDXL'}</span>
                      {img.isFavorite && <FiHeart className="text-gradient" size={16} fill="var(--accent-pink)" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty glass-card">
              <div className="empty-icon"><FiImage /></div>
              <h4>No creations yet</h4>
              <p>You haven't generated or upscaled any images yet. Select one of the tools above to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
