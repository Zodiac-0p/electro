import React from 'react';
import './FeatureCards.css';

const features = [
  {
    icon: '🚚',
    title: 'Free Shipping',
    description: 'Free delivery over ₹1,999.00'
  },
  {
    icon: '🎧',
    title: 'Tech Support',
    description: 'Design suggestions and support'
  },
  {
    icon: '🛡️',
    title: 'Genuine Parts',
    description: 'Experienced Sourcing Team'
  },
  {
    icon: '💬',
    title: 'Whatsapp Support',
    description: 'Quick Support through IM'
  }
];

const FeatureCards = () => {
  return (
    <div className="features-grid">
      {features.map((feature, index) => (
        <div className="feature-card" key={index}>
          <div className="feature-icon">{feature.icon}</div>
          <h3 className="feature-title">{feature.title}</h3>
          <p className="feature-description">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;