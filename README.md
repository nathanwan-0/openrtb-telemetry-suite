# Real-Time Ad Buying Simulator (DSP Dashboard)

This project is a high-speed simulation of a **Demand-Side Platform (DSP)**. In the advertising world, a DSP is the "brain" that companies use to automatically buy ad space across the internet in real-time. Think of it as a high-frequency trading platform, but for digital ads instead of stocks.

## How the System Works

### 1. The Auction Engine (`server.js`)
This is the backend of the system. It simulates the "firehose" of the internet, generating roughly 45,000 ad opportunities every second.
- **OpenRTB Pipeline:** The engine speaks in **OpenRTB**, the industry-standard language for ad auctions. It creates "Bid Requests" and processes our "Bid Responses" in milliseconds.
- **Win Logic:** It compares our **Bid Price** against the market competition. If we bid high enough, we win the auction and get to show our ad.
- **SIVT Simulation:** The engine generates "bot" traffic (fake users). If our protection is turned off, these bots will "steal" our budget by triggering fake ad wins.

### 2. The Dashboard (`src/`)
Built with **Vue 3** and **Tailwind CSS v4**, the dashboard provides real-time telemetry (live data) and control.
- **Reactive State (`useDspState.js`):** This file handles the high-speed data connection. It pulls in live data from the engine and calculates stats like Win Rate and eCPM on the fly.
- **Bento Grid Interface:** The UI uses a modern "Bento" layout to show the most important numbers clearly, with live trend lines (sparklines) tracking performance over time.

---

## Key Features & Terms

### **SIVT Mitigation (Bot Protection)**
**Sophisticated Invalid Traffic (SIVT)** refers to bots that act like real humans to trick advertisers into paying for fake views.
- **How it works:** When active, the system uses behavioral patterns to block these bots before a bid is even made. This protects your **ROAS (Return on Ad Spend)** by ensuring your money is only spent on real people.

### **Bid Price & Bid Floors**
The **Bid Floor** is the minimum price you are willing to pay for an ad spot.
- **The Slider:** You can adjust your bid price in real-time using the sidebar.
- **High Price:** You'll win more ads (higher Win Rate), but each ad costs more.
- **Low Price:** You save money, but you'll see more "Outbid" messages because your price was too low to win.

### **Dynamic Creative Optimization (DCO)**
**DCO** is an automated ad-testing system. Instead of showing just one ad, the system tests several styles (Video, Native, Display) at the same time.
- **Automatic Allocation:** It analyzes the **CTR (Click-Through Rate)** for each style. It then automatically shifts your budget toward the ads that people are actually clicking on.
- **Preventing "Creative Fatigue":** This ensures users don't get bored of seeing the same ad, always showing the version that is performing the best.

---

## Understanding the Stats (KPIs)

| Term | What it stands for | Plain English Explanation |
| :--- | :--- | :--- |
| **QPS** | Queries Per Second | The **speed** of the system. How many ad opportunities we are processing every second. |
| **eCPM** | effective Cost Per Mille | The **price** we pay to show 1,000 ads. Low is efficient; high means we are buying premium spots. |
| **Win Rate** | Auction Success | Our **win percentage**. Tells us if our bid price is high enough to beat the competition. |
| **IVT Rate** | Invalid Traffic | The percentage of **fake traffic** (bots). We want this as close to 0% as possible. |
| **CTR** | Click-Through Rate | The **engagement** level. High CTR means people are actually clicking on the ads. |

---

## Dashboard Navigation

### **1. Overview Tab**
The "Command Center." It shows your main financial stats and the **Live Transaction Stream**. This stream is the raw output of the auction engine, showing every win, loss, and bot block as it happens.

### **2. Network Tab**
A visual look at the "Physical" side of the system.
- **Global Bid Map:** Shows pulses of activity across the world. Green pulses are wins; indigo pulses are bids.
- **Partner Distribution:** A breakdown of which ad networks (like Google or Magnite) are sending us the most traffic.

### **3. Test Variants Tab**
The home of the **DCO Engine**. Here you can see which ad formats (Video vs. Display) are winning the "survival of the fittest" competition for your budget based on their performance.

---

## Installation & Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Auction Engine (Terminal 1):**
    ```bash
    node server.js
    ```

3.  **Launch the Dashboard (Terminal 2):**
    ```bash
    npm run dev
    ```

Open the link shown in Terminal 2 (usually `http://localhost:5173`) to see the live system.
