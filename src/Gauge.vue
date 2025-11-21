<template>
  <div class="gauge-container" ref="container" :style="{ '--gauge-color': color }">
    <svg class="gauge" viewBox="0 0 400 400" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
      <!-- Background Arc -->
      <path class="gauge-bg-arc" :d="bgPath" stroke-linecap="round" />
      
      <!-- Progress Arc -->
      <path 
        ref="gaugeProgress" 
        class="gauge-progress" 
        :d="bgPath" 
        stroke-linecap="round" 
        :stroke-dasharray="arcLength" 
        :stroke-dashoffset="arcLength"
      />
      
      <!-- Ticks -->
      <g class="ticks">
        <line 
          v-for="(tick, index) in ticks" 
          :key="`tick-${index}`"
          :x1="tick.x1" 
          :y1="tick.y1" 
          :x2="tick.x2" 
          :y2="tick.y2" 
          :class="tick.isMajor ? 'major-tick' : 'minor-tick'"
        />
      </g>
      
      <!-- Numbers -->
      <g class="numbers">
        <text 
          v-for="(num, index) in numbers" 
          :key="`num-${index}`"
          :x="num.x" 
          :y="num.y" 
          text-anchor="middle" 
          class="gauge-numbers"
        >
          {{ num.value }}
        </text>
      </g>
      
      <!-- Logo -->
      <image 
        v-if="logo" 
        :href="logo" 
        x="150" 
        y="140" 
        width="100" 
        height="40" 
        preserveAspectRatio="xMidYMid meet" 
      />
      
      <!-- Value Text -->
      <text ref="gaugeValueText" class="gauge-value-text" x="200" y="260" text-anchor="middle">{{ Math.round(currentDisplayValue) }}</text>
      <text class="gauge-unit-text" x="200" y="290" text-anchor="middle">{{ unit }}</text>
      <text class="gauge-unit-text" x="200" y="310" text-anchor="middle" style="font-size: 0.6em; fill: #444;">{{ title }}</text>
    </svg>
    
    <!-- Needle -->
    <div class="needle-container">
      <div ref="needle" class="needle"></div>
      <div class="needle-center"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, toRefs } from 'vue';
import anime from 'animejs';

interface Props {
  modelValue?: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  color?: string;
  logo?: string;
  interactive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  title: '',
  unit: '',
  color: '#ff3b30',
  logo: '',
  interactive: true
});

// const emit = defineEmits(['update:modelValue']); // Unused for now but good practice

const { max } = toRefs(props);

// Refs
const container = ref<HTMLElement | null>(null);
const gaugeProgress = ref<SVGPathElement | null>(null);
const needle = ref<HTMLElement | null>(null);
const gaugeValueText = ref<SVGTextElement | null>(null);

// State
const currentDisplayValue = ref(props.modelValue);
const arcLength = ref(0);

// Constants
const GAUGE_DRAW_CONFIG = {
  centerX: 200,
  centerY: 200,
  radius: 160,
  startAngle: 225,
  endAngle: 495,
  totalAngle: 270
};

// Helpers
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
  ].join(" ");
};

// Computed
const bgPath = computed(() => {
  return describeArc(
    GAUGE_DRAW_CONFIG.centerX,
    GAUGE_DRAW_CONFIG.centerY,
    GAUGE_DRAW_CONFIG.radius,
    GAUGE_DRAW_CONFIG.startAngle,
    GAUGE_DRAW_CONFIG.endAngle
  );
});

const ticks = computed(() => {
  const t = [];
  const totalSubSteps = 50;
  
  for (let i = 0; i <= totalSubSteps; i++) {
    const percentage = i / totalSubSteps;
    const angle = GAUGE_DRAW_CONFIG.startAngle + (GAUGE_DRAW_CONFIG.totalAngle * percentage);
    const isMajor = i % 5 === 0;
    
    const tickLength = isMajor ? 15 : 8;
    const tickRadiusOuter = GAUGE_DRAW_CONFIG.radius - 10;
    const tickRadiusInner = tickRadiusOuter - tickLength;
    
    const start = polarToCartesian(GAUGE_DRAW_CONFIG.centerX, GAUGE_DRAW_CONFIG.centerY, tickRadiusOuter, angle);
    const end = polarToCartesian(GAUGE_DRAW_CONFIG.centerX, GAUGE_DRAW_CONFIG.centerY, tickRadiusInner, angle);
    
    t.push({
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      isMajor
    });
  }
  return t;
});

const numbers = computed(() => {
  const n = [];
  const totalSubSteps = 50;
  
  for (let i = 0; i <= totalSubSteps; i++) {
    if (i % 5 !== 0) continue; // Only major
    
    const percentage = i / totalSubSteps;
    const value = percentage * max.value;
    const angle = GAUGE_DRAW_CONFIG.startAngle + (GAUGE_DRAW_CONFIG.totalAngle * percentage);
    
    const tickLength = 15;
    const tickRadiusOuter = GAUGE_DRAW_CONFIG.radius - 10;
    const tickRadiusInner = tickRadiusOuter - tickLength;
    const textRadius = tickRadiusInner - 25;
    
    const coords = polarToCartesian(GAUGE_DRAW_CONFIG.centerX, GAUGE_DRAW_CONFIG.centerY, textRadius, angle);
    
    n.push({
      x: coords.x,
      y: coords.y + 5,
      value: Math.round(value)
    });
  }
  return n;
});

// Animation Logic
const updateVisuals = (value: number, duration = 1500) => {
  const percentage = Math.min(value / max.value, 1);

  // Value Text
  if (duration > 0) {
    const valueObj = { val: currentDisplayValue.value };
    anime({
      targets: valueObj,
      val: value,
      round: 1,
      easing: 'easeOutCubic',
      duration: duration,
      update: () => {
        currentDisplayValue.value = valueObj.val;
      }
    });
  } else {
    currentDisplayValue.value = value;
  }

  // Progress Bar
  if (gaugeProgress.value) {
    const targetOffset = arcLength.value - (arcLength.value * percentage);
    anime.remove(gaugeProgress.value);
    
    anime({
      targets: gaugeProgress.value,
      strokeDashoffset: targetOffset,
      easing: duration > 0 ? 'easeOutCubic' : 'linear',
      duration: duration,
      complete: () => {
        if (gaugeProgress.value) { // Check existence again
            if (percentage > 0.8) {
            gaugeProgress.value.classList.add('red-zone');
            } else {
            gaugeProgress.value.classList.remove('red-zone');
            }
        }
      }
    });
  }

  // Needle
  if (needle.value) {
    const needleStartAngle = 135;
    const needleTotalAngle = 270;
    const targetRotation = needleStartAngle + (percentage * needleTotalAngle);
    
    anime.remove(needle.value);
    anime({
      targets: needle.value,
      rotate: targetRotation,
      duration: duration,
      easing: duration > 0 ? 'easeOutElastic(1, .6)' : 'linear'
    });
  }
};

// Interaction
const handleMouseMove = (e: MouseEvent) => {
  if (!props.interactive || !container.value) return;
  
  const arc = container.value.querySelector('.gauge-bg-arc');
  if (!arc) return;

  const rect = arc.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const x = e.clientX - centerX;
  const y = e.clientY - centerY;
  let angleRad = Math.atan2(y, x);
  let angleDeg = angleRad * (180 / Math.PI);

  if (angleDeg < 0) angleDeg += 360;

  let gaugeAngle = angleDeg;

  // Clamp logic
  if (gaugeAngle > 45 && gaugeAngle < 135) {
    if (gaugeAngle < 90) gaugeAngle = 45;
    else gaugeAngle = 135;
  }

  let relativeAngle = gaugeAngle - 135;
  if (relativeAngle < 0) relativeAngle += 360;

  const percentage = Math.min(Math.max(relativeAngle / 270, 0), 1);
  const value = percentage * max.value;

  updateVisuals(value, 0);
};

const handleMouseLeave = () => {
  if (!props.interactive) return;
  updateVisuals(props.modelValue, 1500); // Reset to prop value
};

// Lifecycle
onMounted(() => {
  if (gaugeProgress.value) {
    arcLength.value = gaugeProgress.value.getTotalLength();
  }
  updateVisuals(props.modelValue, 1500);
});

watch(() => props.modelValue, (newValue) => {
  updateVisuals(newValue, 1500);
});
</script>

<style scoped>
/* Gauge Container */
.gauge-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.gauge {
    width: 100%;
    height: 100%;
    overflow: visible;
}

/* Clean Gauge Elements */
.gauge-bg-arc {
    stroke: #222;
    stroke-width: 2;
    fill: none;
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1));
}

/* Metallic Background Effect */
.gauge-container::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 85%;
    height: 85%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.8) 80%);
    box-shadow:
        inset 0 0 20px rgba(0, 0, 0, 0.8),
        0 0 10px rgba(0, 0, 0, 0.5);
    z-index: -1;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.gauge-progress {
    stroke: var(--gauge-color, #ff3b30);
    stroke-width: 4;
    fill: none;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 0 6px var(--gauge-color, #ff3b30));
}

.gauge-progress.red-zone {
    stroke: var(--gauge-color, #ff3b30);
}

.major-tick {
    stroke: #fff;
    stroke-width: 3;
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
}

.minor-tick {
    stroke: #888;
    stroke-width: 1.5;
}

.gauge-numbers {
    font-size: 14px;
    font-weight: 600;
    fill: #fff;
    font-family: inherit;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}

.gauge-value-text {
    font-weight: 700;
    fill: #fff;
    font-family: inherit;
    text-shadow: 0 0 10px var(--gauge-color, #ff3b30);
    font-size: 2.5rem;
}

.gauge-unit-text {
    font-weight: 500;
    fill: #666;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 0.75rem;
}

/* Needle */
.needle-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    transform: translate(-50%, -50%);
}

.needle {
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
    background: var(--gauge-color, #ff3b30);
    transform-origin: 0 50%;
    box-shadow: 0 0 8px var(--gauge-color, #ff3b30);
    width: 100px;
}

.needle-center {
    position: absolute;
    top: 0;
    left: 0;
    width: 12px;
    height: 12px;
    background: #1a1a1a;
    border: 2px solid var(--gauge-color, #ff3b30);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    box-shadow: 0 0 10px var(--gauge-color, #ff3b30);
}
</style>
