/**
 * WhatsApp Service — graceful stub
 * whatsapp-web.js needs Puppeteer which is heavy and not always available.
 * This stub keeps the server alive if the package isn't installed.
 * When the package IS installed, it initialises normally.
 */

let client = null;
let currentQR = null;
let isConnected = false;
let available = false;

const initWhatsApp = () => {
  try {
    const { Client, LocalAuth } = require('whatsapp-web.js');
    available = true;

    client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    });

    client.on('qr', (qr) => {
      currentQR = qr;
      isConnected = false;
      console.log('📱 WhatsApp QR received — scan from Admin Dashboard.');
    });

    client.on('ready', () => {
      currentQR = null;
      isConnected = true;
      console.log('✅ WhatsApp Client ready!');
    });

    client.on('authenticated', () => console.log('✅ WhatsApp Authenticated.'));

    client.on('disconnected', (reason) => {
      console.log('⚠️  WhatsApp disconnected:', reason);
      isConnected = false;
      currentQR = null;
      setTimeout(() => client.initialize(), 5000);
    });

    client.initialize();
  } catch {
    console.log('ℹ️  whatsapp-web.js not installed — WhatsApp features disabled.');
  }
};

const getStatus = () => ({ isConnected, qr: currentQR, available });

const sendMessage = async (phone, message) => {
  if (!available || !isConnected || !client) {
    console.log(`[WA-stub] Would send to ${phone}: ${message.substring(0, 50)}...`);
    return;
  }
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('01') && cleaned.length === 11) cleaned = '2' + cleaned;
  else if (!cleaned.startsWith('20')) cleaned = '20' + cleaned;
  await client.sendMessage(`${cleaned}@c.us`, message);
};

module.exports = { initWhatsApp, getStatus, sendMessage };
