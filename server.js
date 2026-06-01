import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Application State
let config = {
  sivtFilterActive: true,
  baseQps: 45000,
  bidFloor: 1.50 // Default floor price
};

const SSPS = ['Google AdX', 'Magnite', 'PubMatic', 'OpenX', 'Index Exchange'];
const FORMATS = ['Display 300x250', 'Video Pre-Roll 15s', 'Native Feed', 'Display 728x90'];

// Generates a mock OpenRTB transaction event
function generateBidEvent() {
  const timestamp = new Date().toISOString().slice(11, 19);
  const ssp = SSPS[Math.floor(Math.random() * SSPS.length)];
  const format = FORMATS[Math.floor(Math.random() * FORMATS.length)];
  const id = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const isIvtOpportunity = ssp === 'OpenX' || Math.random() < 0.08;

  if (isIvtOpportunity && config.sivtFilterActive) {
    return {
      id, timestamp, ssp, format,
      type: 'PRE_BID_REJECT',
      message: `Blocked auction ID ${id} on ${ssp}: SIVT bot signature matched.`,
      cpm: 0.00, isIvt: true, filtered: true
    };
  }

  const baseCpm = ssp === 'Google AdX' ? 3.10 : 2.20;
  const cpm = parseFloat((baseCpm + (Math.random() - 0.3) * 1.5).toFixed(2));
  
  // Win probability now scales with our bid floor relative to the market price
  const winProbability = Math.min(0.9, (config.bidFloor / cpm) * 0.4);
  const win = Math.random() < winProbability;

  if (win) {
    // 5% chance of a click
    if (Math.random() < 0.05) {
      return {
        id, timestamp, ssp, format,
        type: 'CLICK',
        message: `User clicked on ${format} placement on ${ssp}.`,
        cpm, isIvt: isIvtOpportunity, filtered: false
      };
    }

    return {
      id, timestamp, ssp, format,
      type: 'AUCTION_WON',
      message: `Cleared ${format} placement on ${ssp} at $${cpm} eCPM.`,
      cpm, isIvt: isIvtOpportunity, filtered: false
    };
  }

  return {
    id, timestamp, ssp, format,
    type: 'BID_SUBMITTED',
    message: `Outbid on ${ssp} for ${format}. Our bid $${config.bidFloor.toFixed(2)} was too low.`,
    cpm: parseFloat((cpm * 0.8).toFixed(2)),
    isIvt: isIvtOpportunity, filtered: false
  };
}

// Global broadcast loop
setInterval(() => {
  const payload = {
    qps: Math.floor(config.baseQps + (Math.random() - 0.5) * 2500),
    event: generateBidEvent(),
    sivtFilterActive: config.sivtFilterActive,
    bidFloor: config.bidFloor
  };

  const message = JSON.stringify(payload);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}, 200);

// Handle inbound client controls
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (typeof data.sivtFilterActive === 'boolean') {
        config.sivtFilterActive = data.sivtFilterActive;
        console.log(`[Config] SIVT filtering set to: ${config.sivtFilterActive}`);
      }
      if (typeof data.bidFloor === 'number') {
        config.bidFloor = data.bidFloor;
        console.log(`[Config] Bid Floor updated to: $${config.bidFloor.toFixed(2)}`);
      }
    } catch (err) {
      console.error('Invalid control packet:', err);
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`DSP Telemetry Engine running on http://localhost:${PORT}`);
});
