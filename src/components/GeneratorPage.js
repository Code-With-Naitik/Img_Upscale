import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  FiZap, FiDownload, FiRefreshCw, FiInfo,
  FiChevronDown, FiStar, FiCopy, FiTrash2,
  FiUpload, FiX, FiCheck, FiImage
} from 'react-icons/fi';
import { generateAPI, historyAPI } from './api';
import { useAuth } from './AuthContext';
import '../css/GeneratorPage.scss';

const PROMPT_SUGGESTIONS = [
  'A futuristic cityscape at night with neon lights reflecting on wet streets, cinematic photography',
  'A majestic lion in golden savanna, portrait photography, DSLR, bokeh background',
  'An astronaut floating in space above Earth, photorealistic, NASA quality',
  'A mysterious dark forest with glowing mushrooms, fantasy art, cinematic lighting',
  'A beautiful woman in traditional Japanese attire, portrait, soft lighting, 8k',
  'A hyperrealistic dragon perched on mountain peak, digital art, 4K',
  'Vintage 1950s coffee shop interior, warm lighting, film photography',
  'Underwater coral reef with tropical fish, nature photography, crystal clear water',
];

const STYLES = [
  { value: 'realistic', label: 'Photorealistic', desc: 'DSLR quality photos' },
  { value: 'portrait', label: 'Portrait', desc: 'Professional portraits' },
  { value: 'artistic', label: 'Digital Art', desc: 'Concept art quality' },
  { value: 'anime', label: 'Anime', desc: 'Japanese animation style' },
  { value: 'landscape', label: 'Landscape', desc: 'Scenic photography' },
  { value: 'fantasy', label: 'Fantasy', desc: 'Magical & ethereal' },
];

const UPSCALE_LEVELS = ['HD', '2K', '4K', '8K'];

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square', desc: '1:1', width: 1024, height: 1024, ratioClass: 'ratio-1-1' },
  { value: '3:4', label: 'Portrait', desc: '3:4', width: 768, height: 1024, ratioClass: 'ratio-3-4' },
  { value: '4:3', label: 'Landscape', desc: '4:3', width: 1024, height: 768, ratioClass: 'ratio-4-3' },
  { value: '9:16', label: 'Tall', desc: '9:16', width: 576, height: 1024, ratioClass: 'ratio-9-16' },
  { value: '16:9', label: 'Wide', desc: '16:9', width: 1024, height: 576, ratioClass: 'ratio-16-9' }
];

const GeneratorPage = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState('text'); // 'text' or 'fashion'
  const [clothingFiles, setClothingFiles] = useState([]);
  const [selectedClothingId, setSelectedClothingId] = useState(null);

  const activeClothing = clothingFiles.find(item => item.id === selectedClothingId);
  const file = activeClothing ? activeClothing.file : null;
  const preview = activeClothing ? activeClothing.preview : null;

  const [modelGender, setModelGender] = useState('female');
  const [modelType, setModelType] = useState('caucasian');
  const [modelSetting, setModelSetting] = useState('studio');

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [upscaleLevel, setUpscaleLevel] = useState('HD');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const progressRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    const fetchRecentHistory = async () => {
      if (!user) return;
      try {
        const res = await historyAPI.getHistory({ limit: 12 });
        setHistory(res.data.data.images || []);
      } catch (err) {
        console.error('Failed to fetch generator history', err);
      }
    };
    fetchRecentHistory();
  }, [user]);

  // Auto select first file if none is selected
  useEffect(() => {
    if (clothingFiles.length > 0 && !selectedClothingId) {
      setSelectedClothingId(clothingFiles[0].id);
    } else if (clothingFiles.length === 0) {
      setSelectedClothingId(null);
    }
  }, [clothingFiles, selectedClothingId]);

  // Auto set aspect ratio based on selected clothing dimensions
  useEffect(() => {
    if (mode === 'fashion' && activeClothing?.preview) {
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        if (ratio < 0.65) {
          setAspectRatio('9:16');
        } else if (ratio < 0.85) {
          setAspectRatio('3:4');
        } else if (ratio < 1.2) {
          setAspectRatio('1:1');
        } else if (ratio < 1.5) {
          setAspectRatio('4:3');
        } else {
          setAspectRatio('16:9');
        }
      };
      img.src = activeClothing.preview;
    }
  }, [selectedClothingId, clothingFiles, mode, activeClothing]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      clothingFiles.forEach(item => {
        if (item.preview && item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  const handleRemoveClothing = (id, e) => {
    if (e) e.stopPropagation();
    setClothingFiles(prev => {
      const target = prev.find(item => item.id === id);
      if (target && target.preview && target.preview.startsWith('blob:')) {
        URL.revokeObjectURL(target.preview);
      }
      const updated = prev.filter(item => item.id !== id);
      if (selectedClothingId === id) {
        if (updated.length > 0) {
          setSelectedClothingId(updated[0].id);
        } else {
          setSelectedClothingId(null);
        }
      }
      return updated;
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setClothingFiles(prev => {
      const updated = [...prev];
      let addedCount = 0;
      acceptedFiles.forEach(f => {
        if (updated.length < 12) {
          const previewUrl = URL.createObjectURL(f);
          updated.push({
            id: Math.random().toString(36).substring(7),
            file: f,
            preview: previewUrl,
            name: f.name
          });
          addedCount++;
        }
      });
      if (addedCount > 0) {
        toast.success(`Successfully loaded ${addedCount} clothing sample(s)`);
      } else {
        toast.error('Maximum limit of 12 clothing samples reached');
      }
      return updated;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 12,
    multiple: true
  });

  const handleResetFile = () => {
    if (selectedClothingId) {
      handleRemoveClothing(selectedClothingId);
    }
  };

  const simulateProgress = (stages) => {
    let idx = 0;
    const next = () => {
      if (idx >= stages.length) return;
      const [pct, label, delay] = stages[idx];
      setProgress(pct);
      setProgressLabel(label);
      idx++;
      if (idx < stages.length) {
        progressRef.current = setTimeout(next, delay);
      }
    };
    next();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    if (prompt.trim().length < 5) {
      toast.error('Prompt is too short. Be more descriptive!');
      return;
    }
    if (mode === 'fashion' && !file) {
      toast.error('Please upload a clothing reference image first');
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress(0);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    simulateProgress([
      [8, 'Initializing AI model...', 1500],
      [20, 'Analyzing parameters...', 2000],
      [40, mode === 'fashion' ? 'Processing clothing layout...' : 'Generating base image...', 8000],
      [65, mode === 'fashion' ? 'Generating try-on model...' : 'Applying style & details...', 6000],
      [80, 'Running AI enhancement...', 4000],
      [92, 'Upscaling to ' + upscaleLevel + '...', 3000],
    ]);

    try {
      let res;
      if (mode === 'fashion' && file) {
        const formData = new FormData();
        formData.append('prompt', prompt.trim());
        formData.append('style', style);
        formData.append('upscaleLevel', upscaleLevel);
        formData.append('negativePrompt', negativePrompt);
        const selectedRatio = ASPECT_RATIOS.find(r => r.value === aspectRatio) || ASPECT_RATIOS[0];
        formData.append('width', selectedRatio.width);
        formData.append('height', selectedRatio.height);
        formData.append('modelGender', modelGender);
        formData.append('modelType', modelType);
        formData.append('modelSetting', modelSetting);
        formData.append('referenceImage', file);

        res = await generateAPI.generate(formData);
      } else {
        const selectedRatio = ASPECT_RATIOS.find(r => r.value === aspectRatio) || ASPECT_RATIOS[0];
        res = await generateAPI.generate({
          prompt: prompt.trim(),
          negativePrompt,
          style,
          upscaleLevel,
          width: selectedRatio.width,
          height: selectedRatio.height
        });
      }

      clearTimeout(progressRef.current);
      setProgress(100);
      setProgressLabel('Complete! ✨');

      setTimeout(() => {
        setResult(res.data.data);
        setHistory(prev => [res.data.data, ...prev.slice(0, 11)]);
        setLoading(false);
        setProgress(0);
        toast.success(mode === 'fashion' ? 'AI Try-on image generated!' : 'Image generated & enhanced!');
      }, 800);

    } catch (err) {
      clearTimeout(progressRef.current);
      setLoading(false);
      setProgress(0);
      const msg = err.response?.data?.message || 'Generation failed. Check your API key.';
      toast.error(msg);
    }
  };

  const handleDownload = (url) => {
    if (!url) return;
    try {
      toast.loading('Preparing download...', { id: 'download-toast' });
      const filename = url.substring(url.lastIndexOf('/') + 1);
      window.location.href = `/api/images/download?filename=${filename}`;
      toast.success('Download started!', { id: 'download-toast' });
    } catch (err) {
      console.error('Failed to download image', err);
      window.open(url, '_blank');
      toast.success('Opening in new tab (right-click to save)', { id: 'download-toast' });
    }
  };

  const handleCopyPrompt = (p) => {
    navigator.clipboard.writeText(p);
    toast.success('Prompt copied!');
  };

  return (
    <div className="generator-page">
      <div className="gen-container">

        {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="badge-glass mb-3">
            <FiZap size={12} />
            Stable Diffusion XL + Auto Enhancement
          </div>
          <h1>AI Image <span className="gradient-text">Generator</span></h1>
          <p>Enter your prompt → AI generates → Auto enhances to {upscaleLevel}</p>
        </motion.div>

        <div className="gen-layout">
          {/* LEFT: Controls */}
          <motion.div
            className="gen-controls"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="control-card glass-card">
              {/* Mode Selector */}
              <div className="mode-selector-container" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '50px', border: 'var(--border-glass)' }}>
                <button
                  type="button"
                  className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
                  onClick={() => setMode('text')}
                  style={{ flex: 1, padding: '10px 20px', borderRadius: '50px', border: 'none', background: mode === 'text' ? 'var(--gradient-btn)' : 'transparent', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)' }}
                >
                  Text-to-Image
                </button>
                <button
                  type="button"
                  className={`mode-btn ${mode === 'fashion' ? 'active' : ''}`}
                  onClick={() => setMode('fashion')}
                  style={{ flex: 1, padding: '10px 20px', borderRadius: '50px', border: 'none', background: mode === 'fashion' ? 'var(--gradient-btn)' : 'transparent', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)' }}
                >
                  AI Model Try-On
                </button>
              </div>

              {/* Clothing Dropzone for Try-on Mode */}
              {mode === 'fashion' && (
                <div className="control-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="control-label" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Upload Clothing Sample</label>
                  <div
                    {...getRootProps()}
                    className={`dropzone-area glass-card ${isDragActive ? 'drag-active' : ''} ${clothingFiles.length > 0 ? 'has-file' : ''}`}
                    style={{ 
                      padding: clothingFiles.length > 0 ? '0.75rem 1rem' : '1.5rem', 
                      border: '2px dashed rgba(255,255,255,0.15)', 
                      borderRadius: 'var(--radius-md)', 
                      cursor: 'pointer', 
                      textAlign: 'center', 
                      transition: 'var(--transition)' 
                    }}
                  >
                    <input {...getInputProps()} />
                    {clothingFiles.length > 0 ? (
                      <div className="dropzone-content-compact" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FiUpload size={14} className="text-gradient" />
                        <span className="small-text" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Drag & drop or <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>browse</span> to add more
                        </span>
                      </div>
                    ) : (
                      <div className="dropzone-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <FiUpload size={18} className="text-gradient" />
                        <p className="small-text" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Drag & drop or <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>browse</span></p>
                        <span className="tiny-text" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>JPG, PNG, WEBP • Max 20MB</span>
                      </div>
                    )}
                  </div>

                  {/* Clothing Gallery Grid */}
                  {clothingFiles.length > 0 && (
                    <div className="clothing-gallery">
                      <div className="gallery-header">
                        <span>
                          Select Clothing ({clothingFiles.length}/12)
                        </span>
                        <button 
                          type="button" 
                          onClick={() => {
                            clothingFiles.forEach(item => {
                              if (item.preview && item.preview.startsWith('blob:')) {
                                URL.revokeObjectURL(item.preview);
                              }
                            });
                            setClothingFiles([]);
                          }}
                          className="clear-all-btn"
                        >
                          <FiTrash2 size={10} /> Clear all
                        </button>
                      </div>
                      <div className="clothing-gallery-grid">
                        {clothingFiles.map((item) => {
                          const isSelected = selectedClothingId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedClothingId(item.id)}
                              style={{
                                position: 'relative',
                                aspectRatio: '1',
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: isSelected ? '0 0 8px rgba(124, 58, 237, 0.4)' : 'none',
                                transition: 'var(--transition)'
                              }}
                            >
                              <img 
                                src={item.preview} 
                                alt={item.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              {isSelected && (
                                <div 
                                  style={{ 
                                    position: 'absolute', 
                                    top: '4px', 
                                    left: '4px', 
                                    background: 'var(--accent-primary)', 
                                    borderRadius: '50%', 
                                    width: '14px', 
                                    height: '14px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                  }}
                                >
                                  <FiCheck size={8} color="#fff" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleRemoveClothing(item.id, e)}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  background: 'rgba(10, 10, 26, 0.8)',
                                  border: 'none',
                                  color: '#fff',
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <FiX size={8} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Try-on Model Selection Options */}
              {mode === 'fashion' && (
                <div className="fashion-options-grid mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div className="control-group" style={{ textAlign: 'left' }}>
                    <label className="control-label" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Model Gender</label>
                    <select
                      className="form-input select-input"
                      value={modelGender}
                      onChange={(e) => setModelGender(e.target.value)}
                      style={{ padding: '8px 10px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'var(--border-glass)', borderRadius: 'var(--radius-sm)', width: '100%' }}
                    >
                      <option value="female" style={{ background: '#0a0a1a' }}>Female</option>
                      <option value="male" style={{ background: '#0a0a1a' }}>Male</option>
                      <option value="unisex" style={{ background: '#0a0a1a' }}>Unisex</option>
                    </select>
                  </div>

                  <div className="control-group" style={{ textAlign: 'left' }}>
                    <label className="control-label" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Model Ethnicity</label>
                    <select
                      className="form-input select-input"
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value)}
                      style={{ padding: '8px 10px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'var(--border-glass)', borderRadius: 'var(--radius-sm)', width: '100%' }}
                    >
                      <option value="caucasian" style={{ background: '#0a0a1a' }}>Caucasian</option>
                      <option value="asian" style={{ background: '#0a0a1a' }}>Asian</option>
                      <option value="african" style={{ background: '#0a0a1a' }}>African</option>
                      <option value="latina" style={{ background: '#0a0a1a' }}>Latina</option>
                      <option value="hispanic" style={{ background: '#0a0a1a' }}>Hispanic</option>
                    </select>
                  </div>

                  <div className="control-group" style={{ gridColumn: 'span 2', textAlign: 'left' }}>
                    <label className="control-label" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Setting / Backdrop</label>
                    <select
                      className="form-input select-input"
                      value={modelSetting}
                      onChange={(e) => setModelSetting(e.target.value)}
                      style={{ padding: '8px 10px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'var(--border-glass)', borderRadius: 'var(--radius-sm)', width: '100%' }}
                    >
                      <option value="studio" style={{ background: '#0a0a1a' }}>Studio (Solid backdrops)</option>
                      <option value="urban street" style={{ background: '#0a0a1a' }}>Urban Street (City sidewalk)</option>
                      <option value="fashion runway" style={{ background: '#0a0a1a' }}>Fashion Runway (Stage lights)</option>
                      <option value="nature park" style={{ background: '#0a0a1a' }}>Nature Park (Greenery)</option>
                      <option value="cafe" style={{ background: '#0a0a1a' }}>Cozy Cafe (Warm interior)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Prompt */}
              <div className="control-group">
                <label className="control-label">
                  {mode === 'fashion' ? 'Describe Clothing Details' : 'Prompt'}
                  <button
                    type="button"
                    className="label-btn"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                  >
                    <FiStar size={12} /> Ideas
                  </button>
                </label>
                <textarea
                  className="form-input prompt-input"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={mode === 'fashion' ? "Describe the outfit shown, e.g. 'a crimson red floral summer dress with a slit'" : "Describe your image in detail... e.g. 'A stunning portrait of a woman in a futuristic city, cinematic lighting, 8K'"}
                  rows={5}
                />

                {/* Suggestions */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      className="suggestions-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="suggestions-list">
                        {PROMPT_SUGGESTIONS.map((s, i) => (
                          <button
                            key={i}
                            className="suggestion-item"
                            onClick={() => {
                              setPrompt(s);
                              setShowSuggestions(false);
                            }}
                          >
                            <FiZap size={11} />
                            {s.substring(0, 65)}...
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Style Selection */}
              <div className="control-group">
                <label className="control-label">Style</label>
                <div className="style-grid">
                  {STYLES.map(s => (
                    <button
                      key={s.value}
                      className={`style-btn ${style === s.value ? 'active' : ''}`}
                      onClick={() => setStyle(s.value)}
                    >
                      <span className="style-name">{s.label}</span>
                      <span className="style-desc">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="control-group">
                <label className="control-label">Aspect Ratio</label>
                <div className="aspect-ratio-grid">
                  {ASPECT_RATIOS.map(ratio => (
                    <button
                      key={ratio.value}
                      className={`aspect-btn ${aspectRatio === ratio.value ? 'active' : ''}`}
                      onClick={() => setAspectRatio(ratio.value)}
                    >
                      <span className={`aspect-box ${ratio.ratioClass}`} />
                      <span className="aspect-label">{ratio.label}</span>
                      <span className="aspect-desc">{ratio.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upscale Level */}
              <div className="control-group">
                <label className="control-label">Output Quality</label>
                <div className="upscale-selector">
                  {UPSCALE_LEVELS.map(level => (
                    <button
                      key={level}
                      className={`upscale-btn ${upscaleLevel === level ? 'active' : ''}`}
                      onClick={() => setUpscaleLevel(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="control-group">
                <button
                  className="advanced-toggle"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  Advanced Settings
                  <FiChevronDown
                    style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.3s' }}
                  />
                </button>
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="advanced-panel"
                    >
                      <label className="control-label mt-3">Negative Prompt</label>
                      <textarea
                        className="form-input"
                        value={negativePrompt}
                        onChange={e => setNegativePrompt(e.target.value)}
                        placeholder="What to avoid... e.g. blurry, cartoon, low quality"
                        rows={3}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Generate Button */}
              <button
                className="btn-primary-gradient generate-btn"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
                  <>
                    <div className="spinner-gradient sm" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiZap />
                    Generate & Enhance
                  </>
                )}
              </button>

              {/* Progress */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="progress-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="progress-info">
                      <span className="progress-label">{progressLabel}</span>
                      <span className="progress-pct">{progress}%</span>
                    </div>
                    <div className="progress-bar-custom">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="progress-steps">
                      {['Generate', 'Enhance', 'Upscale', 'Done'].map((s, i) => (
                        <div key={i} className={`prog-step ${progress >= (i + 1) * 25 ? 'done' : progress >= i * 25 ? 'active' : ''}`}>
                          {s}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* RIGHT: Result */}
          <motion.div
            ref={resultRef}
            className="gen-result"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="result-card glass-card">
              <AnimatePresence mode="wait">
                {loading && !result && (
                  <motion.div
                    key="loading"
                    className="result-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="ai-loader-container">
                      <div className="ai-scanner-box">
                        <div className="scanner-line" />
                        <div className="hologram-grid" />
                        <div className="morphing-orb" />
                        <div className="floating-particles">
                          <span className="particle p1" />
                          <span className="particle p2" />
                          <span className="particle p3" />
                          <span className="particle p4" />
                          <span className="particle p5" />
                        </div>
                      </div>
                      <div className="loader-text-container">
                        <div className="pulse-icon-wrapper">
                          <FiZap className="zap-pulse-icon" />
                        </div>
                        <h3>{progressLabel || 'Initializing...'}</h3>
                        <div className="loader-progress-bar">
                          <div className="loader-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {result && !loading && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="result-content"
                  >
                    <div className="result-header">
                      <h3>Generated Result</h3>
                      <div className="result-badges">
                        <span className="badge-glass">{result.upscaleLevel}</span>
                        <span className="badge-glass">AI Enhanced</span>
                      </div>
                    </div>

                    {/* Compare Slider */}
                    {result.originalUrl && result.enhancedUrl && result.originalUrl !== result.enhancedUrl ? (
                      <div className="compare-wrapper">
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
                          style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '70vh' }}
                        />
                        <div className="compare-labels">
                          <span>{mode === 'fashion' ? 'Clothing Item' : 'Original'}</span>
                          <span>{mode === 'fashion' ? 'AI Try-On Model' : `AI Enhanced ${result.upscaleLevel}`}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="single-result">
                        <img src={result.enhancedUrl || result.originalUrl} alt="Generated" />
                      </div>
                    )}

                    {/* Result Info */}
                    <div className="result-meta">
                      {result.enhancedSize && (
                        <>
                          <div className="meta-item">
                            <span>Resolution</span>
                            <strong>{result.enhancedSize.width} × {result.enhancedSize.height}</strong>
                          </div>
                          <div className="meta-item">
                            <span>Quality</span>
                            <strong>{result.upscaleLevel} Enhanced</strong>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="result-actions">
                      <button
                        className="btn-primary-gradient"
                        onClick={() => handleDownload(result.enhancedUrl || result.originalUrl, 'pixelforge')}
                      >
                        <FiDownload /> Download {result.upscaleLevel}
                      </button>
                      <button className="btn-glass" onClick={() => handleCopyPrompt(prompt)}>
                        <FiCopy /> Copy Prompt
                      </button>
                      <button className="btn-glass" onClick={handleGenerate}>
                        <FiRefreshCw /> Regenerate
                      </button>
                    </div>
                  </motion.div>
                )}

                {!result && !loading && (
                  <motion.div
                    key="empty"
                    className="result-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="empty-icon">
                      <FiZap />
                    </div>
                    <h3>Your Image Will Appear Here</h3>
                    <p>Enter a prompt and click Generate to create a stunning AI image. It will be automatically enhanced to {upscaleLevel} quality.</p>
                    <div className="empty-features">
                      <span><FiInfo size={12} /> Auto Enhancement</span>
                      <span><FiInfo size={12} /> {upscaleLevel} Upscaling</span>
                      <span><FiInfo size={12} /> DSLR Quality</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            className="gen-history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="history-header">
              <h3>Recent Generations</h3>
              <button className="btn-glass btn-sm" onClick={() => setHistory([])}>
                <FiTrash2 size={13} /> Clear
              </button>
            </div>
            <div className="history-grid">
              {history.map((item, i) => (
                <motion.div
                  key={i}
                  className="history-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setResult(item)}
                >
                  <img src={item.enhancedUrl || item.originalUrl} alt={`gen-${i}`} />
                  <div className="history-overlay">
                    <span className="badge-glass">{item.upscaleLevel}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GeneratorPage;
