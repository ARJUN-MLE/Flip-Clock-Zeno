# Flip Clock Zeno

Flip Clock Zeno is a browser-based clock with a mechanical flip-card display. It combines a live clock, stopwatch, and configurable countdown timer with selectable themes, fonts, and clock sounds.

## Features

### Live Time

- Displays the current time with weekday, date, and an AM/PM indicator.
- Choose 12-hour or 24-hour time in Settings.

### Stopwatch

- Tracks elapsed hours, minutes, and seconds.
- Includes start, pause, and reset controls.

### Timer

- Choose HMS, Minutes, or Seconds timer modes.
- HMS mode has separate Hours, Minutes, and Seconds number inputs. Its input maxima are 24 hours, 59 minutes, and 59 seconds.
- Minutes and Seconds modes provide a single corresponding number input.
- Start, pause, and reset the countdown.

### Flip Clock and Sounds

- Digit cards use a CSS flip animation when displayed values change.
- Timer input changes animate the corresponding digits, with flip timing adapted to the rate of input changes.
- Clock transition sounds are generated with the browser Web Audio API. Select one of ten styles in Settings: Classic Flip, Soft Plastic, Crisp Snap, Heavy Mechanism, Metallic Click, Rubber Pad, Spring Return, Wooden Clack, Servo Tick, and Vintage Relay.
- The Sound button turns clock sounds on or off.

### Themes and Appearance

- Select from nine preset themes: Space, Nature, Forest, Ocean, Sunset, Midnight, Desert, Aurora, and Minimal.
- Customize font, clock, card, background, and accent colors with the Custom theme controls.
- Choose from nine dial fonts: Digital LCD, Seven Segment, Terminal, Clean Sans, Geometric, Monospace, Retro, Mechanical, and Elegant.
- Adjust font weight, size, and spacing in Settings.

### Responsive Layout

The interface adapts for smaller screens, including adjustments to navigation, footer controls, timer inputs, and digit-card dimensions at mobile widths.

## Technologies

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4 and custom CSS
- Lucide React icons
- Browser Web Audio API for synthesized clock sounds
- Geist and Geist Mono fonts loaded through `next/font`

## Run Locally

Use Node.js and npm from the project directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

Create a production build:

```bash
npm run build
```

Run the production build locally:

```bash
npm run start
```

Run ESLint:

```bash
npm run lint
```
