// src/pages/Webinars.js
import React from 'react';
import './Webinars.css';

const Webinars = () => {
  return (
    <div className="webinars-container">
      <h2>Upcoming Webinars</h2>
      <ul className="webinars-list">
        <li>Introduction to React - 3:00 PM, Oct 30</li>
        <li>Advanced JavaScript - 11:00 AM, Nov 5</li>
      </ul>
    </div>
  );
};

export default Webinars;
