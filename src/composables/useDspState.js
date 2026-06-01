import { reactive, toRefs, onMounted, onUnmounted } from 'vue';

const state = reactive({
  activeTab: 'overview',
  sivtFilterActive: true,
  bidFloor: 1.50,
  alerts: [],
  qps: 0,
  eCpm: 0,
  winRate: 0,
  ctr: 0.145,
  ivtRate: 0.0,
  logs: [],
  history: {
    eCpm: [],
    winRate: [],
    ctr: [],
    ivtRate: []
  },
  mapEvents: [],
  partnerData: [
    { name: 'Google AdX', share: 40, color: '#4285F4' },
    { name: 'Magnite', share: 20, color: '#FF5A5F' },
    { name: 'PubMatic', share: 15, color: '#00A699' },
    { name: 'OpenX', share: 15, color: '#FC642D' },
    { name: 'Index', share: 10, color: '#484848' }
  ],
  dcoVariants: [
    { id: 'Native_Feed_600x400', format: 'Native', ctr: 0.285, allocation: 25 },
    { id: 'Display_Desktop_300x250', format: 'Display', ctr: 0.092, allocation: 25 },
    { id: 'Video_PreRoll_15s', format: 'Video', ctr: 0.421, allocation: 25 },
    { id: 'Display_Mobile_320x50', format: 'Display', ctr: 0.074, allocation: 25 }
  ]
});

let ws = null;
let historicalEvents = [];

function recalculateAggregates() {
  if (historicalEvents.length === 0) return;

  const total = historicalEvents.length;
  const wins = historicalEvents.filter(e => e.type === 'AUCTION_WON');
  const clicks = historicalEvents.filter(e => e.type === 'CLICK');
  const ivtCount = historicalEvents.filter(e => e.isIvt);
  const filteredCount = historicalEvents.filter(e => e.filtered);

  // Compute metrics using a rolling history sequence
  state.winRate = (wins.length / (total - filteredCount.length || 1)) * 100;
  state.ctr = (clicks.length / (wins.length || 1));
  
  const totalCpm = wins.reduce((sum, e) => sum + e.cpm, 0);
  state.eCpm = totalCpm / (wins.length || 1);
  state.ivtRate = (ivtCount.length / total) * 100;

  // Update history for sparklines
  const updateHistory = (key, val) => {
    state.history[key].push(val);
    if (state.history[key].length > 30) state.history[key].shift();
  };
  updateHistory('eCpm', state.eCpm);
  updateHistory('winRate', state.winRate);
  updateHistory('ctr', state.ctr);
  updateHistory('ivtRate', state.ivtRate);

  // Jitter CTR and run DCO algorithm allocation shifts
  state.dcoVariants.forEach(v => {
    v.ctr = Math.max(0.01, v.ctr + (Math.random() - 0.5) * 0.003);
  });
  const sumCtr = state.dcoVariants.reduce((s, v) => s + v.ctr, 0);
  state.dcoVariants.forEach(v => {
    v.allocation = Math.round((v.ctr / sumCtr) * 100);
  });
}

export function useDspState() {
  const connect = () => {
    ws = new WebSocket('ws://localhost:4000');

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      state.qps = data.qps;
      state.sivtFilterActive = data.sivtFilterActive;

      historicalEvents.unshift(data.event);
      state.logs.unshift(data.event);

      // Add a random map pulse event
      if (Math.random() > 0.8) {
        state.mapEvents.push({
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          type: data.event.type
        });
        if (state.mapEvents.length > 15) state.mapEvents.shift();
      }

      // Slightly jitter partner data for visual movement
      state.partnerData.forEach(p => {
        p.share = Math.max(5, p.share + (Math.random() - 0.5) * 0.5);
      });

      if (historicalEvents.length > 200) historicalEvents.pop();
      if (state.logs.length > 40) state.logs.pop();

      recalculateAggregates();
    };
  };

  const toggleSivtFilter = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ sivtFilterActive: !state.sivtFilterActive }));
    }
  };

  const updateBidFloor = (val) => {
    state.bidFloor = val;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ bidFloor: val }));
    }
  };

  const addAlert = (msg, type = 'info') => {
    state.alerts.unshift({ id: Date.now(), msg, type });
    if (state.alerts.length > 5) state.alerts.pop();
  };

  const disconnect = () => {
    if (ws) ws.close();
  };

  return {
    ...toRefs(state),
    connect,
    disconnect,
    toggleSivtFilter,
    updateBidFloor,
    addAlert
  };
}
