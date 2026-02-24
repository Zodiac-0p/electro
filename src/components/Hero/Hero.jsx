import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

const heroSlides = [
  {
    title: "Everything You Need, in Every Circuit",
    subtitle: "10,000+ components in stock, ready to ship across India.",
    img: "/images/image1.jpg",
    cta: "Shop Now",
    subtitlecolor: "#ffffff",   
  },
  {
    title: "Latest Electronics Trends 2024",
    subtitle: "Discover the newest innovations in IoT and embedded systems.",
    img: "/images/image3.jpg",
    cta: "Explore Now",
    subtitlecolor: "#ffffff"
  },
  {
    title: "Raspberry Pi 5 Now Available!",
    subtitle: "Get your hands on the latest Raspberry Pi with improved performance.",
    img: "/images/image2.jpg",
    cta: "Buy Now",
    subtitlecolor: "#ffffff"
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const startAuto = () => {
    stopAuto();
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
  };

  const stopAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    startAuto();
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCTAClick = () => navigate("/AllProducts");

  const goTo = (index) => {
    setCurrentSlide(index);
    startAuto();
  };

  return (
    <section className="hero" onMouseEnter={stopAuto} onMouseLeave={startAuto}>
      <div
        className="hero-track"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {heroSlides.map((slide, idx) => (
          <div key={idx} className="hero-slide">
            {/* ✅ inner wrapper creates spacing without peeking */}
            <div
              className="hero-slide-inner"
              style={{ backgroundImage: `url(${slide.img})` }}
            >
              <div className="hero-overlay" />
              <div className="hero-content">
                <h1>{slide.title}</h1>
            <p
              style={{
                color: "#c6c6c7e1",
                opacity: 1,
                fontWeight: 500,
                textShadow: "0 2px 10px rgba(0,0,0,0.45)",
              }}
            >{slide.subtitle}</p>
            
                <button className="hero-cta" onClick={handleCTAClick}>
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-dots">
        {heroSlides.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentSlide === index ? "active" : ""}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;