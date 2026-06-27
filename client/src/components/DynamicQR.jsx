import React, { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Use relative URL — proxied by Vite to http://localhost:5000
const API = '/api';

/**
 * DynamicQR — fetches a fresh QR from the server every 60 seconds.
 * Server uses TOTP (crypto HMAC) so QR expires server-side after 1 minute.
 */
const DynamicQR = () => {
  const [qrData, setQrData] = useState(null);
  const [expiresIn, setExpiresIn] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQR = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('gym_token');
      const res = await axios.get(`${API}/user/qr-entry`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrData(res.data.qr);
      setExpiresIn(res.data.expires_in || 60);
      setError(null);
    } catch (err) {
      setError('Failed to generate QR.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchQR();
  }, [fetchQR]);

  // Countdown timer
  useEffect(() => {
    if (expiresIn <= 0) {
      fetchQR();
      return;
    }
    const timer = setInterval(() => {
      setExpiresIn(prev => {
        if (prev <= 1) {
          fetchQR();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresIn, fetchQR]);

  const urgency = expiresIn < 15;

  return (
    <div className="dynamic-qr-wrapper">
      <div className="qr-header">
        <h3>🔐 Entry QR Code</h3>
        <p>Show this to reception for gym entry</p>
      </div>

      <div className="qr-container">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="qr-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="qr-spinner" />
              <span>Generating...</span>
            </motion.div>
          ) : error ? (
            <div className="qr-error">
              <span>⚠️ {error}</span>
              <button onClick={fetchQR} className="btn-outline" style={{ marginTop: '1rem', padding: '8px 20px' }}>
                Retry
              </button>
            </div>
          ) : (
            <motion.div
              key={qrData}
              className="qr-image-wrapper"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.4 }}
            >
              {/* Display the base64 QR from server */}
              <img src={qrData} alt="Entry QR Code" className="qr-image" />
              <div className="qr-corner qr-tl" />
              <div className="qr-corner qr-tr" />
              <div className="qr-corner qr-bl" />
              <div className="qr-corner qr-br" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer bar */}
      <div className="qr-timer">
        <div className="timer-bar-bg">
          <motion.div
            className="timer-bar-fill"
            style={{ backgroundColor: urgency ? '#ff4444' : '#39ff14' }}
            animate={{ width: `${(expiresIn / 60) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span
          className="timer-label"
          style={{ color: urgency ? '#ff4444' : '#888' }}
        >
          {urgency && '⚠️ '}Refreshes in {expiresIn}s
        </span>
      </div>

      <p className="qr-note">
        🚫 Screenshots won't work — this QR expires every 60 seconds for your security.
      </p>
    </div>
  );
};

export default DynamicQR;
