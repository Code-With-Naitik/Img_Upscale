import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import toast from 'react-hot-toast';
import {
    FiUpload, FiImage, FiDownload, FiRefreshCw,
    FiZap, FiTrendingUp, FiX, FiCheck
} from 'react-icons/fi';
import { upscaleAPI } from './api';
import '../css/UpscalerPage.scss';

const UPSCALE_LEVELS = [
    { value: 'HD', label: 'HD', res: '1920×1080', desc: 'Standard HD' },
    { value: '2K', label: '2K', res: '2560×1440', desc: 'Quad HD' },
    { value: '4K', label: '4K', res: '3840×2160', desc: 'Ultra HD' },
    { value: '8K', label: '8K', res: '7680×4320', desc: 'Cinema grade' },
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const UpscalerPage = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [upscaleLevel, setUpscaleLevel] = useState('4K');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            const err = rejectedFiles[0].errors[0];
            if (err.code === 'file-too-large') {
                toast.error('File too large. Maximum size is 20MB');
            } else {
                toast.error('Invalid file type. Use JPG, PNG, or WEBP');
            }
            return;
        }

        const f = acceptedFiles[0];
        if (!f) return;

        setFile(f);
        setResult(null);

        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(f);

        toast.success(`Image loaded: ${f.name}`);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE,
        multiple: false
    });

    const handleUpscale = async () => {
        if (!file) {
            toast.error('Please upload an image first');
            return;
        }

        setLoading(true);
        setProgress(0);
        setResult(null);

        // Simulate progress
        let prog = 0;
        const progInterval = setInterval(() => {
            prog += Math.random() * 8;
            if (prog >= 90) { clearInterval(progInterval); prog = 90; }
            setProgress(Math.min(prog, 90));
        }, 800);

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('upscaleLevel', upscaleLevel);

            const res = await upscaleAPI.upscale(formData, (e) => {
                if (e.total) {
                    setUploadProgress(Math.round((e.loaded / e.total) * 100));
                }
            });

            clearInterval(progInterval);
            setProgress(100);

            setTimeout(() => {
                setResult(res.data.data);
                setLoading(false);
                setProgress(0);
                toast.success(`Image upscaled to ${upscaleLevel}!`);
            }, 600);

        } catch (err) {
            clearInterval(progInterval);
            setLoading(false);
            setProgress(0);
            const msg = err.response?.data?.message || 'Upscaling failed. Please try again.';
            toast.error(msg);
        }
    };

    const handleDownload = () => {
        if (!result?.enhancedUrl) return;
        try {
            toast.loading('Preparing download...', { id: 'download-toast' });
            const filename = result.enhancedUrl.substring(result.enhancedUrl.lastIndexOf('/') + 1);
            window.location.href = `/api/images/download?filename=${filename}`;
            toast.success('Download started!', { id: 'download-toast' });
        } catch (err) {
            console.error('Failed to download image', err);
            window.open(result.enhancedUrl, '_blank');
            toast.success('Opening in new tab (right-click to save)', { id: 'download-toast' });
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setProgress(0);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="upscaler-page">
            <div className="upscaler-container">

                {/* Header */}
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="badge-glass mb-3">
                        <FiTrendingUp size={12} />
                        AI-Powered Image Upscaling
                    </div>
                    <h1>AI Image <span className="gradient-text">Upscaler</span></h1>
                    <p>Upload any image and upscale to HD, 2K, 4K or 8K with AI enhancement</p>
                </motion.div>

                {/* Upscale Level Selector */}
                <motion.div
                    className="level-selector"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {UPSCALE_LEVELS.map(level => (
                        <button
                            key={level.value}
                            className={`level-card ${upscaleLevel === level.value ? 'active' : ''}`}
                            onClick={() => setUpscaleLevel(level.value)}
                        >
                            <div className="level-label">{level.label}</div>
                            <div className="level-res">{level.res}</div>
                            <div className="level-desc">{level.desc}</div>
                            {upscaleLevel === level.value && (
                                <div className="level-check"><FiCheck size={12} /></div>
                            )}
                        </button>
                    ))}
                </motion.div>

                {/* Main Area */}
                <div className="upscaler-main">
                    {/* Upload Zone */}
                    {!result && (
                        <motion.div
                            className="upload-zone-wrapper"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div
                                {...getRootProps()}
                                className={`dropzone-area glass-card ${isDragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                            >
                                <input {...getInputProps()} />

                                {file && preview ? (
                                    <div className="file-preview">
                                        <div className="preview-image">
                                            <img src={preview} alt="Preview" />
                                            <button
                                                className="remove-btn"
                                                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                        <div className="file-info">
                                            <div className="file-details">
                                                <FiImage size={16} />
                                                <div>
                                                    <div className="file-name">{file.name}</div>
                                                    <div className="file-size">{formatFileSize(file.size)}</div>
                                                </div>
                                            </div>
                                            <div className="file-ready">
                                                <FiCheck size={14} />
                                                Ready to upscale to {upscaleLevel}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="dropzone-content">
                                        <motion.div
                                            className="upload-icon-wrapper"
                                            animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="upload-icon">
                                                <FiUpload size={32} />
                                            </div>
                                        </motion.div>

                                        {isDragActive ? (
                                            <div className="drag-text">
                                                <h3>Drop your image here</h3>
                                            </div>
                                        ) : (
                                            <div className="drop-text">
                                                <h3>Drag & Drop Your Image</h3>
                                                <p>or <span>click to browse</span> your files</p>
                                                <div className="drop-specs">
                                                    <span>JPG, PNG, WEBP</span>
                                                    <span>•</span>
                                                    <span>Max 20MB</span>
                                                    <span>•</span>
                                                    <span>Any resolution</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Upscale Button */}
                            {file && (
                                <motion.div
                                    className="upscale-actions"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <button
                                        className="btn-primary-gradient upscale-btn"
                                        onClick={handleUpscale}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="spinner-gradient sm" />
                                                Upscaling to {upscaleLevel}...
                                            </>
                                        ) : (
                                            <>
                                                <FiZap />
                                                Upscale to {upscaleLevel}
                                            </>
                                        )}
                                    </button>
                                    <button className="btn-glass" onClick={handleReset} disabled={loading}>
                                        <FiX /> Remove
                                    </button>
                                </motion.div>
                            )}

                            {/* Progress */}
                            <AnimatePresence>
                                {loading && (
                                    <motion.div
                                        className="upscale-progress"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="progress-info">
                                            <span>Upscaling to {upscaleLevel}...</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="progress-bar-custom">
                                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="progress-stage">
                                            {progress < 30 ? 'Uploading image...' :
                                                progress < 60 ? 'AI analyzing image...' :
                                                    progress < 85 ? 'Upscaling & enhancing...' :
                                                        'Finalizing...'}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* Result */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                className="result-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="result-header">
                                    <div>
                                        <h2>Enhancement <span className="gradient-text">Complete</span></h2>
                                        <p>Drag the slider to compare before & after</p>
                                    </div>
                                    <div className="result-btns">
                                        <button className="btn-primary-gradient" onClick={handleDownload}>
                                            <FiDownload /> Download {result.upscaleLevel}
                                        </button>
                                        <button className="btn-glass" onClick={handleReset}>
                                            <FiRefreshCw /> New Image
                                        </button>
                                    </div>
                                </div>

                                <div className="compare-container">
                                    <ReactCompareSlider
                                        itemOne={
                                            <ReactCompareSliderImage
                                                src={result.originalUrl}
                                                alt="Original"
                                            />
                                        }
                                        itemTwo={
                                            <ReactCompareSliderImage
                                                src={result.enhancedUrl}
                                                alt="Enhanced"
                                            />
                                        }
                                        style={{
                                            borderRadius: 'var(--radius-lg)',
                                            overflow: 'hidden',
                                            maxHeight: '70vh'
                                        }}
                                    />
                                    <div className="compare-labels">
                                        <div className="label-original">
                                            <FiImage size={12} />
                                            Original
                                        </div>
                                        <div className="label-enhanced">
                                            <FiZap size={12} />
                                            {result.upscaleLevel} Enhanced
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="result-stats">
                                    <div className="stat-card glass-card">
                                        <div className="stat-icon original"><FiImage /></div>
                                        <div className="stat-info">
                                            <div className="stat-title">Original</div>
                                            <div className="stat-val">
                                                {result.originalSize?.width} × {result.originalSize?.height}
                                            </div>
                                            <div className="stat-size">
                                                {result.originalSize?.fileSize
                                                    ? formatFileSize(result.originalSize.fileSize)
                                                    : 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-arrow"><FiTrendingUp size={24} /></div>
                                    <div className="stat-card glass-card enhanced">
                                        <div className="stat-icon enhanced"><FiZap /></div>
                                        <div className="stat-info">
                                            <div className="stat-title">{result.upscaleLevel} Enhanced</div>
                                            <div className="stat-val">
                                                {result.enhancedSize?.width} × {result.enhancedSize?.height}
                                            </div>
                                            <div className="stat-size">
                                                {result.enhancedSize?.fileSize
                                                    ? formatFileSize(result.enhancedSize.fileSize)
                                                    : 'Enhanced'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Features Row */}
                <motion.div
                    className="upscaler-features"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {[
                        { icon: <FiZap />, title: 'AI Enhanced', desc: 'Smart upscaling with detail preservation' },
                        { icon: <FiImage />, title: 'No Artifacts', desc: 'Clean, sharp output without noise' },
                        { icon: <FiTrendingUp />, title: 'DSLR Quality', desc: 'Professional-grade image enhancement' },
                        { icon: <FiDownload />, title: 'Instant Download', desc: 'Download in seconds, full quality' },
                    ].map((f, i) => (
                        <div key={i} className="feature-pill glass-card">
                            <div className="pill-icon">{f.icon}</div>
                            <div className="pill-content">
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default UpscalerPage;