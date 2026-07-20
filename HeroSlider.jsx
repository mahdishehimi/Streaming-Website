import React, { useEffect, useState, useRef, useCallback } from 'react';
import '../styles/hero.css';

const HeroSlider = ({ media = [], interval = 4500 }) => {
  const slides = media.filter(m => m.image);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (!slides.length) return;
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % slides.length);
    }, interval);
  }, [slides.length, interval]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const prev = useCallback(() => {
    clearInterval(timerRef.current);
    setIndex(i => (i - 1 + slides.length) % slides.length);
    startTimer();
  }, [slides.length, startTimer]);

  const next = useCallback(() => {
    clearInterval(timerRef.current);
    setIndex(i => (i + 1) % slides.length);
    startTimer();
  }, [slides.length, startTimer]);

  if (!slides.length) return (
    <div className="hero-slider empty">
      <div className="hero-placeholder">No featured media</div>
    </div>
  );

  return (
    <div
      className="hero-slider improved"
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={() => startTimer()}
      ref={containerRef}
    >
      {slides.map((s, i) => (
        <div key={s.id || i} className={`slide ${i === index ? 'active' : ''}`} role="group" aria-roledescription="slide" aria-label={s.title}>
          <div className="slide-content">
            <div className="poster">
              <img src={s.image} alt={s.title} />
            </div>
            <div className="slide-meta">
              <h2>{s.title}</h2>
              <p className="meta-sub">{s.year ? s.year : ''} {s.rating ? `• ${Number(s.rating).toFixed(1)}` : ''}</p>
              {s.overview && <p className="overview">{s.overview}</p>}
              <div className="hero-actions">
                <button className="btn play">▶ Play</button>
                <button className="btn add">＋ My List</button>
              </div>
            </div>
          </div>
          <div className="slide-bg" style={{ backgroundImage: `url(${s.image})` }} />
        </div>
      ))}

      <button className="slider-btn prev" onClick={prev} aria-label="Previous">‹</button>
      <button className="slider-btn next" onClick={next} aria-label="Next">›</button>

      <div className="slider-dots">
        {slides.map((_, i) => (
          <button key={i} className={`dot ${i === index ? 'active' : ''}`} onClick={() => { setIndex(i); startTimer(); }} aria-label={`Go to slide ${i+1}`} />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
