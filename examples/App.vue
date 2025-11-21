<template>
  <div class="dashboard">
    <div class="porsche-logo">PORSCHE</div>

    <div class="gauge-cluster">
      <!-- Far Left: Clients -->
      <div class="gauge-wrapper gauge-small" id="gauge-left-2">
        <Gauge 
          :modelValue="350" 
          :max="500" 
          title="CLIENTS" 
          color="#00f2ff" 
        />
      </div>

      <!-- Mid Left: Visites -->
      <div class="gauge-wrapper gauge-medium" id="gauge-left-1">
        <Gauge 
          :modelValue="35" 
          :max="50" 
          title="VISITES" 
          unit="K" 
          color="#00ff41" 
        />
      </div>

      <!-- Center: Revenue (Main) -->
      <div class="gauge-wrapper gauge-large" id="gauge-center">
        <Gauge 
          :modelValue="88" 
          :max="120" 
          title="REVENU" 
          unit="K€/MOIS" 
          color="#ff3b30" 
          logo="../images/LOGO-CDR-GROUP_FINAL_2025.png"
        />
      </div>

      <!-- Mid Right: Panier Moyen -->
      <div class="gauge-wrapper gauge-medium" id="gauge-right-1">
        <Gauge 
          :modelValue="210" 
          :max="300" 
          title="PANIER" 
          unit="€" 
          color="#ffcc00" 
        />
      </div>

      <!-- Far Right: Conversion -->
      <div class="gauge-wrapper gauge-small" id="gauge-right-2">
        <Gauge 
          :modelValue="4.2" 
          :max="40" 
          title="CONV." 
          unit="%" 
          color="#d400ff" 
        />
      </div>
    </div>

    <div class="controls">
      <p style="color: #666; font-size: 0.9rem;">Move cursor over gauges to interact</p>
    </div>
  </div>
</template>

<script setup>
import Gauge from 'sport-gauge'
</script>

<style>
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #111;
    color: #fff;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
}

.dashboard {
    background: #1a1a1a;
    border-radius: 24px;
    padding: 60px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 1400px;
}

.porsche-logo {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 4px;
    margin-bottom: 40px;
    color: #fff;
    opacity: 0.9;
}

.gauge-cluster {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin: 20px auto;
    height: 450px;
    position: relative;
}

.gauge-wrapper {
    position: relative;
    transition: all 0.3s ease;
}

/* Gauge Sizes */
.gauge-large {
    width: 400px;
    height: 400px;
    z-index: 10;
    margin: 0 -20px;
}

.gauge-medium {
    width: 300px;
    height: 300px;
    z-index: 5;
    margin-bottom: 20px;
}

.gauge-small {
    width: 240px;
    height: 240px;
    z-index: 1;
    margin-bottom: 50px;
}

/* Individual positioning for the arc look */
#gauge-left-1 { margin-right: -40px; }
#gauge-right-1 { margin-left: -40px; }
#gauge-left-2 { margin-right: -30px; }
#gauge-right-2 { margin-left: -30px; }
</style>
