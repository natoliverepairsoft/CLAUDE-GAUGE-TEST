# Sport Gauge

A customizable, sports-car inspired gauge component for web applications.

## Installation

```bash
npm install sport-gauge
```

## Usage

1.  **Import**: Import the component in your Vue app.

```javascript
import Gauge from 'sport-gauge';
```

2.  **Template**: Use the component.

```html
<Gauge 
  :modelValue="currentSpeed"
  :max="300"
  title="SPEED"
  unit="KM/H"
  color="#ff3b30"
  logo="path/to/logo.png"
/>
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `modelValue` | Number | `0` | Current value of the gauge. |
| `min` | Number | `0` | Minimum value. |
| `max` | Number | `100` | Maximum value. |
| `title` | String | `''` | Title displayed at the bottom. |
| `unit` | String | `''` | Unit displayed below the value. |
| `color` | String | `'#ff3b30'` | Hex color code for elements. |
| `logo` | String | `''` | URL/Path to logo image. |
| `interactive` | Boolean | `true` | Enable cursor interaction. |

## Dependencies

*   `animejs`: Used for smooth animations.
*   `vue`: Peer dependency (Vue 3).
