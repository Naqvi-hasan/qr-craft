# QR Craft — Customizable QR Code Generator

Create, customize, scan, and print QR codes with a modern, browser-based QR studio.

**[Live Demo](https://qr-craft-sigma.vercel.app/) · [Source Code](https://github.com/Naqvi-hasan/qr-craft)**

QR Craft is a free QR code generation application built with Next.js and React. It supports multiple QR formats, custom visual styles, print-ready designs, QR scanning, and local design storage without requiring user registration.

## ✨ Features

### QR Studio
- Generate QR codes for URLs, plain text, phone numbers, SMS, email, Wi-Fi, UPI payments, contacts, locations, events, and more.
- Customize colours, dot patterns, corner shapes, themes, and designs.
- Preview QR codes while editing.
- Export QR codes in PNG, SVG, and PDF formats.
- Check whether generated designs remain scannable.

### Templates and Print Studio
- Start with ready-made templates for business cards, café menus, Wi-Fi sharing, and other use cases.
- Customize print layouts and QR code placement.
- Create business cards, invitations, review cards, badges, stickers, posters, and other print designs.
- Export double-sided PDFs, print-shop PDFs with bleed and crop marks, and A4 print sheets.
- Generate bulk print documents from CSV data or numbered ranges.

### QR Scanner and Event Gate Check
- Scan QR codes using a camera or uploaded image.
- Inspect QR content before opening links.
- Validate event tickets offline as valid, already used, or unknown.
- Export gate-validation results to CSV.
- Add supported event QR details to a calendar.

### My Library
- Save QR designs locally in the browser.
- Reopen, edit, duplicate, and download saved designs.
- Back up and restore saved data using JSON.

### User Experience
- Dark and light themes.
- Hindi and English support.
- Responsive interface for different screen sizes.
- No sign-up required.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Framework | Next.js 15, React 19 |
| Language | JavaScript |
| Styling | Tailwind CSS v4 |
| QR Generation | qrcode-generator, custom SVG rendering |
| PDF Export | jsPDF |
| QR Scanning | jsQR |
| Browser Storage | IndexedDB, localStorage |
| Browser APIs | SVG, Canvas, Camera API, Web Share |
| Testing | Node.js built-in test runner |
| Deployment | Vercel, GitHub |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18 or newer
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Naqvi-hasan/qr-craft.git
cd qr-craft
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Open the application

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing and Production Build

Run the test suite:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

Run the production server after a successful build:

```bash
npm start
```

The project summary reports 54 tests using Node.js's built-in test runner.

## 🔒 Privacy and Browser Requirements

QR generation, scanning, and saved designs are designed to work in the browser. Camera access requires permission and a secure context, such as HTTPS or localhost.

Saved designs are stored locally in the browser rather than automatically syncing to a cloud account. Browser data may be lost if local site data is cleared, so use the backup feature when needed.

## 🌐 Live Application

Try QR Craft: **[https://qr-craft-sigma.vercel.app/](https://qr-craft-sigma.vercel.app/)**

## 🔮 Future Improvements

- User accounts and cloud-based design synchronization.
- Dynamic QR codes and scan analytics.
- Multi-gate ticket validation with shared data.
- Bulk QR image generation with ZIP export.
- Progressive Web App support.
- Expanded language support and additional QR types.
- Drag-and-drop design editing.

## 👨‍💻 Author

**Hasan Abbas Naqvi**

- GitHub: [Naqvi-hasan](https://github.com/Naqvi-hasan)
- LinkedIn: www.linkedin.com/in/hasan-abbas-naqvi-673490253
- Live Project: [QR Craft](https://qr-craft-sigma.vercel.app/)
