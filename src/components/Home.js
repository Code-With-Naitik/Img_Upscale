import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiZap, FiArrowRight, FiStar, FiImage,
  FiCpu, FiTrendingUp, FiShield, FiDownload,
  FiUsers, FiAward, FiCheck
} from 'react-icons/fi';
import ParticlesBackground from './ParticlesBackground';
import '../css/Home.scss';

const features = [
  { icon: <FiZap />, title: 'AI Generation', desc: 'Generate stunning images from text prompts using SDXL' },
  { icon: <FiTrendingUp />, title: 'Auto Enhancement', desc: 'Every image automatically enhanced with AI pipeline' },
  { icon: <FiCpu />, title: '8K Upscaling', desc: 'Upscale to HD, 2K, 4K, and 8K resolution instantly' },
  { icon: <FiShield />, title: 'HDR Quality', desc: 'DSLR quality output with cinematic lighting' },
  { icon: <FiDownload />, title: 'Instant Download', desc: 'Download enhanced images in seconds' },
  { icon: <FiImage />, title: 'Batch Processing', desc: 'Generate and upscale multiple images at once' },
];

const stats = [
  { value: '10M+', label: 'Images Generated' },
  { value: '500K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4K', label: 'Max Resolution' },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    credits: '10 credits',
    features: ['10 AI generations', 'HD upscaling', 'Basic enhancement', 'PNG/JPG download', 'Community support'],
    cta: 'Start Free',
    href: '/register',
    popular: false
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    credits: '500 credits',
    features: ['500 AI generations', '4K upscaling', 'Advanced AI enhancement', 'Priority processing', 'API access', 'Batch generation', 'Priority support'],
    cta: 'Get Pro',
    href: '/register',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    credits: 'Unlimited',
    features: ['Unlimited generations', '8K upscaling', 'Custom AI models', 'White-label solution', 'Dedicated server', 'SLA guarantee', '24/7 support'],
    cta: 'Contact Sales',
    href: '/register',
    popular: false
  }
];

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
};

const Home = () => {
  return (
    <div className="home-page">
      <ParticlesBackground />

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-orbs">
          <div className="orb orb-purple" style={{ top: '10%', left: '5%' }} />
          <div className="orb orb-cyan" style={{ top: '30%', right: '8%' }} />
          <div className="orb orb-pink" style={{ bottom: '20%', left: '20%' }} />
        </div>

        <div className="hero-container">
          <motion.div
            className="hero-content"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp}>
              <div className="badge-glass mb-4">
                <FiStar size={12} />
                Powered by Stable Diffusion XL
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} className="hero-title">
              Create & Enhance
              <br />
              <span className="gradient-text">AI Images</span>
              <br />
              in Seconds
            </motion.h1>

            <motion.p variants={fadeUp} className="hero-desc">
              Generate photorealistic images from text prompts, then automatically
              upscale to 4K or 8K quality. Professional DSLR results with one click.
            </motion.p>

            <motion.div variants={fadeUp} className="hero-ctas">
              <Link to="/generate" className="btn-primary-gradient btn-lg">
                <FiZap /> Generate Image
              </Link>
              <Link to="/upscaler" className="btn-glass btn-lg">
                <FiTrendingUp /> Upscale Image
                <FiArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="hero-stats">
              {stats.map((s, i) => (
                <div key={i} className="hero-stat">
                  <div className="stat-value gradient-text">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="hero-image-card">
              <div className="image-placeholder">
                <div className="image-grid-demo">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className={`demo-img-item demo-item-${n}`}>
                      <div className="demo-shimmer" />
                    </div>
                  ))}
                </div>
                <div className="hero-badge-float badge-generate">
                  <FiZap size={14} />
                  Generating...
                  <div className="badge-progress"><div className="badge-fill" /></div>
                </div>
                <div className="hero-badge-float badge-hd" style={{ bottom: '20%', right: '-10%' }}>
                  <FiTrendingUp size={14} />
                  HD Enhanced ✓
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="container-custom">
          <div className="section-header">
            <div className="section-label"><FiCpu size={12} /> Core Features</div>
            <h2>Everything You Need for <span className="gradient-text">AI Image Creation</span></h2>
            <p>From prompt to photorealistic 4K image — fully automated, lightning fast</p>
          </div>

          <motion.div
            className="features-grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="feature-card glass-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="workflow-section">
        <div className="container-custom">
          <div className="section-header">
            <div className="section-label"><FiZap size={12} /> Simple Process</div>
            <h2>How <span className="gradient-text">PixelForge</span> Works</h2>
          </div>

          <div className="workflow-steps">
            {[
              { step: '01', title: 'Enter Your Prompt', desc: 'Describe your vision in detail. Our AI understands complex, creative prompts.' },
              { step: '02', title: 'AI Generates Image', desc: 'Stable Diffusion XL creates a photorealistic image in seconds.' },
              { step: '03', title: 'Auto Enhancement', desc: 'AI automatically enhances quality, sharpens details, and improves lighting.' },
              { step: '04', title: 'Download in HD', desc: 'Get your final image in HD, 2K, 4K or 8K — ready to use.' },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="workflow-step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <div className="step-number">{s.step}</div>
                <div className="step-content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                {i < 3 && <div className="step-connector" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <div className="container-custom">
          <div className="section-header">
            <div className="section-label"><FiAward size={12} /> Pricing</div>
            <h2>Simple, <span className="gradient-text">Transparent</span> Pricing</h2>
            <p>Start free, upgrade when you need more power</p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                className={`pricing-card glass-card ${plan.popular ? 'popular' : ''}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                {plan.popular && (
                  <div className="popular-badge">Most Popular</div>
                )}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">
                  <span className="price-value">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
                <div className="plan-credits">{plan.credits}</div>
                <ul className="plan-features">
                  {plan.features.map((f, j) => (
                    <li key={j}><FiCheck size={14} />{f}</li>
                  ))}
                </ul>
                <Link to={plan.href} className={plan.popular ? 'btn-primary-gradient w-100 justify-content-center' : 'btn-glass w-100 justify-content-center'}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container-custom">
          <motion.div
            className="cta-card glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="cta-orb" />
            <div className="section-label mb-3"><FiUsers size={12} /> Join 500K+ Users</div>
            <h2>Start Creating <span className="gradient-text">Stunning AI Images</span> Today</h2>
            <p>No credit card required. Get 10 free generations instantly.</p>
            <div className="cta-btns">
              <Link to="/register" className="btn-primary-gradient btn-lg">
                <FiZap /> Start Free
              </Link>
              <Link to="/generate" className="btn-glass btn-lg">
                Try Generator <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
