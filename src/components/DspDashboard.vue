<template>
  <div class="flex h-screen w-full bg-[#0b0e14] text-slate-100 font-sans overflow-hidden select-none relative">
    
    <!-- Glass Sidebar -->
    <aside class="w-64 panel border-r border-white/5 flex flex-col justify-between p-6 shrink-0 z-20 relative">
      <div class="space-y-8">
        <div class="flex items-center gap-3 px-2 py-1">
          <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">DSP Core</span>
        </div>

        <nav class="space-y-2">
          <button v-for="tab in ['overview', 'network', 'dco']" :key="tab"
          @click="activeTab = tab"
          :class="activeTab === tab ? 'bg-white/10 text-white border-white/10' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border-transparent'"
          class="w-full text-left px-4 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-widest transition-all duration-300 flex items-center gap-3 border cursor-pointer"
          >
            <!-- Icons for navigation -->
            <svg v-if="tab === 'overview'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <svg v-else-if="tab === 'network'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>
            
            {{ tab === 'dco' ? 'Test Variants' : tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </nav>

        <!-- Bid Price Slider -->
        <div class="pt-6 border-t border-white/10 space-y-4">
          <div class="flex justify-between text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
            <span>Bid Price (Floor)</span>
            <span>${{ bidFloor.toFixed(2) }}</span>
          </div>
          <input type="range" min="0.5" max="5.0" step="0.1" v-model.number="bidFloorInput" @input="updateBidFloor(bidFloorInput)"
            class="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500">
          <p class="text-[10px] text-slate-400 leading-tight">
            Setting a high <b>Bid Floor</b> helps you win more ads, while a low floor saves money but limits your reach.
          </p>
        </div>
      </div>

      <div class="p-5 bg-white/5 border border-white/10 rounded-2xl">
        <span class="text-[10px] font-semibold text-indigo-400 tracking-[0.15em] uppercase block mb-2">SIVT Mitigation</span>
        <p class="text-[11px] text-slate-400 leading-relaxed mb-4 text-left">
          Blocks bots and fake traffic using behavioral patterns. This ensures you only pay for ads real people see.
        </p>
        <button @click="toggleSivtFilter"
          :class="sivtFilterActive ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-amber-950/30 border-amber-500/30 text-amber-400'"
          class="w-full py-2.5 text-[10px] font-semibold rounded-lg border uppercase tracking-widest transition-all cursor-pointer hover:opacity-90">
          {{ sivtFilterActive ? 'Guardrails: Active' : 'Guardrails: Off' }}
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 bg-transparent z-10 relative">
      <!-- Header -->
      <header class="h-16 border-b border-white/5 px-8 flex items-center justify-between backdrop-blur-xl bg-black/20">
        <div class="flex items-center gap-4">
          <h1 class="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
            Server Node <span class="text-white/80 font-black">US-01</span>
          </h1>
          <div class="h-4 w-px bg-white/10"></div>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span class="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest">OpenRTB Pipeline</span>
          </div>
        </div>
        
        <!-- Alerts -->
        <div class="flex-1 max-w-md px-12">
          <transition name="fade-slide" mode="out-in">
            <div v-if="currentAlert" :key="currentAlert.id" 
                 :class="currentAlert.type === 'warning' ? 'text-amber-400' : 'text-indigo-400'"
                 class="text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
              <span>-</span> {{ currentAlert.msg }}
            </div>
          </transition>
        </div>

        <div class="text-right font-mono">
          <span class="text-[9px] block text-slate-500 uppercase tracking-tighter font-black">Scale</span>
          <span class="text-xs text-white font-black">{{ qps.toLocaleString() }} <span class="text-[10px] text-white/30 font-sans">QPS</span></span>
        </div>
      </header>

      <div class="p-8 flex-1 flex flex-col overflow-hidden space-y-8">
        
        <!-- Tab: Overview -->
        <div v-if="activeTab === 'overview'" class="flex-1 flex flex-col space-y-8 overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
            <div v-for="stat in stats" :key="stat.label" class="p-6 bg-white/5 border border-white/10 rounded-3xl group relative overflow-hidden">
              <div class="absolute bottom-0 left-0 w-full h-1/2 opacity-20 pointer-events-none">
                <svg viewBox="0 0 100 40" class="w-full h-full">
                  <path :d="generateSparkline(stat.hist)" fill="none" stroke="currentColor" :class="stat.color" stroke-width="2" vector-effect="non-scaling-stroke" />
                </svg>
              </div>
              <span class="text-[10px] font-black tracking-widest uppercase block mb-4 relative z-10" :class="stat.color">{{ stat.label }}</span>
              <div class="text-3xl font-black font-mono tracking-tighter text-white relative z-10">
                {{ stat.val }} <span class="text-xs text-white/20 font-sans tracking-normal ml-1">{{ stat.sub }}</span>
              </div>
            </div>
          </div>

          <div class="flex-1 bg-black/40 border border-white/5 rounded-[2rem] p-8 flex flex-col overflow-hidden relative group">
            <div class="flex justify-between items-center pb-6 border-b border-white/5 mb-6 relative z-10">
              <span class="text-[10px] font-black text-white/60 tracking-[0.2em] uppercase flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                Transaction Audit Output
              </span>
              <span class="text-[9px] font-mono text-emerald-500/60 font-black">Status: 200 OK</span>
            </div>
            <div class="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 pr-4 relative z-10 scrollbar-hide select-text">
              <div v-for="log in logs" :key="log.id" class="flex items-center gap-6 py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-4 rounded-xl transition-all">
                <span class="text-white/20 shrink-0 tabular-nums">[{{ log.timestamp }}]</span>
                <span :class="logTypeClass(log.type)" class="shrink-0 w-28 text-center text-[9px] uppercase tracking-tighter">{{ log.type }}</span>
                <span class="text-white/40 flex-1 truncate font-medium">{{ log.message }}</span>
                <span :class="statusClass(log)" class="shrink-0 font-black w-8 text-right tracking-tighter">
                  {{ log.filtered ? '403' : log.type === 'AUCTION_WON' ? '200' : '204' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Network -->
        <div v-else-if="activeTab === 'network'" class="flex-1 flex flex-col space-y-8 overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
            <div class="lg:col-span-2 bg-black/40 border border-white/5 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group">
              <div class="absolute inset-0 opacity-10 pointer-events-none">
                <svg viewBox="0 0 800 400" class="w-full h-full stroke-white/20 fill-transparent">
                  <path d="M100 150 L200 120 L300 180 L400 140 L500 200 L600 160 L700 220" /><path d="M50 250 L150 220 L250 280 L350 240 L450 300 L550 260 L650 320" />
                </svg>
              </div>
              <div v-for="dot in mapEvents" :key="'p-'+dot.id" :style="{ left: dot.x + '%', top: dot.y + '%' }" class="map-dot absolute w-1 h-1 rounded-full">
                <div class="absolute inset-0" :class="dot.type === 'AUCTION_WON' ? 'bg-emerald-500' : 'bg-indigo-500'"></div>
              </div>
              <div class="relative z-10 flex justify-between mb-8">
                <div>
                  <h3 class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Global Bid Locations</h3>
                  <p class="text-[11px] text-slate-500 mt-1">Live visual of incoming ad auctions across the globe.</p>
                </div>
                <div class="flex gap-4">
                  <div v-for="t in ['Wins', 'Bids']" :key="t" class="flex items-center gap-2">
                    <div :class="t === 'Wins' ? 'bg-emerald-500' : 'bg-indigo-500'" class="w-1.5 h-1.5 rounded-full"></div>
                    <span class="text-[9px] font-bold text-white/40 uppercase">{{ t }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-black/40 border border-white/5 rounded-[2rem] p-8 flex flex-col relative overflow-hidden">
              <h3 class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Partner Distribution</h3>
              <p class="text-[11px] text-slate-500 mb-6 leading-relaxed">Shows which ad networks (SSPs) are sending us the most traffic.</p>
              <div class="flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-hide">
                <div v-for="partner in partnerData" :key="partner.name" class="space-y-2">
                  <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                    <span>{{ partner.name }}</span> <span class="text-white/40 tabular-nums">{{ partner.share.toFixed(1) }}%</span>
                  </div>
                  <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div :style="{ width: partner.share + '%', backgroundColor: partner.color }" class="h-full transition-all duration-700 opacity-60"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Test Variants -->
        <div v-else class="flex-1 flex flex-col space-y-8 overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
            <div class="lg:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div class="space-y-6">
                <span class="text-[10px] text-indigo-400 tracking-[0.2em] uppercase font-black block">Optimization (DCO)</span>
                <h2 class="text-2xl font-black text-white leading-tight">DCO Variant Engine</h2>
                <p class="text-xs text-slate-400 leading-relaxed text-left">
                  <b>Dynamic Creative Optimization (DCO)</b> tests different ads (Video, Image, Text) at the same time. The system automatically puts more budget into the ads that get the most clicks.
                </p>
                <div class="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2">
                  <span class="text-[9px] font-black text-indigo-300 uppercase block">Why it matters:</span>
                  <p class="text-[10px] text-indigo-200/60 leading-normal italic text-left">
                    This prevents <b>"Creative Fatigue"</b> (when people get bored of seeing the same ad) by always showing the best-performing version.
                  </p>
                </div>
              </div>
            </div>
            <div class="lg:col-span-2 bg-black/40 border border-white/5 rounded-[2rem] p-8 overflow-y-auto scrollbar-hide">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="v in dcoVariants" :key="v.id" class="bg-white/5 p-6 rounded-2xl border border-white/10 transition-all hover:border-white/20 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-12 h-12 opacity-10 m-2">
                    <svg v-if="v.format === 'Video'" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    <svg v-else-if="v.format === 'Native'" viewBox="0 0 24 24" fill="white"><path d="M19 3H5v14h14V5c0-1.1-.9-2-2-2zM5 5h14v14H5V5z"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="white"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  </div>
                  <div class="flex justify-between items-center mb-4 relative z-10">
                    <span class="text-xs font-black text-white uppercase">{{ v.id.replace(/_/g, ' ') }}</span>
                    <span class="text-[10px] font-mono text-indigo-400 font-black">{{ v.ctr.toFixed(3) }}% CTR</span>
                  </div>
                  <div class="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
                    <div :style="{ width: v.allocation + '%' }" class="h-full bg-indigo-500 transition-all duration-700"></div>
                  </div>
                  <div class="flex justify-between text-[9px] font-bold text-white/30 uppercase">
                    <span>Budget Allocation</span> <span>{{ v.allocation }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useDspState } from '../composables/useDspState.js';

const { 
  activeTab, sivtFilterActive, bidFloor, alerts, qps, eCpm, winRate, ctr, ivtRate, logs, history, mapEvents, partnerData, dcoVariants, 
  connect, disconnect, toggleSivtFilter, updateBidFloor, addAlert 
} = useDspState();

const bidFloorInput = ref(1.50);
const currentAlert = computed(() => alerts.value[0] || null);

const stats = computed(() => [
  { label: 'Pricing', val: '$' + eCpm.value.toFixed(2), sub: 'eCPM', color: 'text-indigo-400', hist: history.value.eCpm },
  { label: 'Success', val: winRate.value.toFixed(1) + '%', sub: 'Win Rate', color: 'text-emerald-400', hist: history.value.winRate },
  { label: 'Clicks', val: (ctr.value * 10).toFixed(2), sub: 'Index', color: 'text-fuchsia-400', hist: history.value.ctr },
  { label: 'Fake Traffic', val: ivtRate.value.toFixed(1) + '%', sub: 'IVT', color: 'text-amber-400', hist: history.value.ivtRate }
]);

const logTypeClass = (type) => ({
  'text-indigo-400/80': type === 'BID_SUBMITTED',
  'text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded': type === 'AUCTION_WON',
  'text-amber-500 font-black bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20': type === 'PRE_BID_REJECT'
});

const statusClass = (log) => log.filtered ? 'text-amber-400/80' : log.type === 'AUCTION_WON' ? 'text-emerald-400/80' : 'text-white/10';

watch(winRate, (val) => val < 5 && activeTab.value === 'overview' && addAlert("Warning: Win Rate too low. We are being outbid.", "warning"));
watch(sivtFilterActive, (active) => {
  if (active) {
    // Remove all bot traffic alerts
    alerts.value = alerts.value.filter(alert => !alert.msg.includes("High Bot Traffic"));
  }
});

watch(ivtRate, (val) => {
  if (val > 8) {
    if (!sivtFilterActive.value) {
      // Avoid duplicate bot traffic alerts
      const hasBotAlert = alerts.value.some(alert => alert.msg.includes("High Bot Traffic"));
      if (!hasBotAlert) {
        addAlert("Alert: High Bot Traffic. Protection recommended.", "warning");
      }
    }
  } else {
    // Optionally clear alert if traffic is normal
    alerts.value = alerts.value.filter(alert => !alert.msg.includes("High Bot Traffic"));
  }
});

const generateSparkline = (data) => {
  if (!data || data.length < 2) return '';
  const max = Math.max(...data) || 1, min = Math.min(...data) || 0, range = max - min || 1;
  return data.map((v, i) => ` ${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * 100} ${40 - ((v - min) / range) * 35}`).join('');
};

onMounted(() => { connect(); addAlert("System Online. Target Node: US_EAST", "info"); });
onUnmounted(disconnect);
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(5px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
