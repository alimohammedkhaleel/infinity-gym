const { Client, LocalAuth } = require('whatsapp-web.js');

let client = null;
let currentQR = null;
let isConnected = false;

const initWhatsApp = () => {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    currentQR = qr;
    isConnected = false;
    console.log('WhatsApp QR Code received. Please scan it from the Admin Dashboard.');
  });

  client.on('ready', () => {
    currentQR = null;
    isConnected = true;
    console.log('✅ WhatsApp Client is ready!');
  });

  client.on('authenticated', () => {
    console.log('✅ WhatsApp Authenticated!');
  });

  client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp was disconnected', reason);
    isConnected = false;
    currentQR = null;
    client.initialize();
  });

  client.initialize();
};

const getStatus = () => {
  return { isConnected, qr: currentQR };
};

const sendMessage = async (phone, message) => {
  if (!isConnected || !client) {
    throw new Error('WhatsApp client is not connected.');
  }
  
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '2' + cleaned;
  } else if (!cleaned.startsWith('20')) {
    cleaned = '20' + cleaned;
  }
  
  const chatId = `${cleaned}@c.us`;
  await client.sendMessage(chatId, message);
};

module.exports = { initWhatsApp, getStatus, sendMessage };
