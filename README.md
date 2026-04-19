# Sketch Grids — Angular Application

> Professional grid maker for artists, designers and educators.

## Tech Stack

- **Framework**: Angular 17 (Standalone components)
- **State**: Angular Signals
- **Styling**: SCSS with CSS custom properties
- **PWA**: Angular Service Worker
- **Testing**: Karma + Jasmine
- **Canvas**: HTML5 Canvas API

## Features

- 🎨 Real-time canvas grid preview  
- 📐 Configurable columns, rows, cell size, margins  
- 🎨 Custom line colour, width, opacity, dash style  
- 🖼 Image overlay with stretch / fit / cover modes  
- 📏 A4 / Letter / A3 / A5 / Square / Custom page sizes  
- 🖨 Multi-DPI export (72 – 300 DPI)  
- 💾 PNG / JPG / WEBP export  
- 📱 PWA — installable on desktop (Windows/macOS/Linux) and Android  
- 🍎 iOS/iPadOS browser extension support via PWA  

## Quick Start

```bash
# Install dependencies
npm install

# Dev server
npm start
# → http://localhost:4200

# Build for production
npm run build:prod

# Run tests
npm test
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── header/           # .html .ts .scss .spec.ts
│   │   ├── sidebar/          # .html .ts .scss .spec.ts
│   │   └── canvas-preview/   # .html .ts .scss .spec.ts
│   ├── models/
│   │   └── grid.model.ts
│   ├── services/
│   │   ├── grid.service.ts
│   │   └── grid.service.spec.ts
│   ├── app.component.*
│   ├── app.config.ts
│   └── app.routes.ts
├── styles.scss               # Global design tokens
├── index.html
├── main.ts
├── manifest.webmanifest
└── ngsw-config.json
```

## Platform Support

| Platform   | Method         | Notes                                |
|------------|----------------|--------------------------------------|
| Windows    | PWA Install    | Chrome/Edge prompt or browser menu   |
| macOS      | PWA Install    | Chrome/Safari                        |
| Android    | PWA Install    | Add to Home Screen                   |
| iOS/iPadOS | Safari PWA     | Add to Home Screen via Share sheet   |
| Linux      | PWA Install    | Chrome/Chromium                      |

## License

MIT
