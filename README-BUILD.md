# Building E-Paper Ebook Reader for Windows

This guide will help you create a Windows installer (.exe) for the E-Paper Ebook Reader.

## Prerequisites

1. **Node.js** - Download and install from https://nodejs.org/ (LTS version recommended)
2. **Git** (optional) - For version control

## Step-by-Step Build Instructions

### 1. Install Dependencies

Open Command Prompt or PowerShell in the project folder and run:

```bash
npm install
```

This will install Electron and Electron Builder.

### 2. Test the Application

Before building, test if the app works:

```bash
npm start
```

This will launch the application in development mode. Test all features to ensure everything works.

### 3. Build the Windows Installer

To create the Windows installer (.exe):

```bash
npm run build
```

This will create:
- A Windows installer in the `dist` folder
- The installer will be named something like `E-Paper Ebook Reader Setup 1.0.0.exe`

**Build time**: First build may take 5-10 minutes as it downloads necessary files.

### 4. Build Options

**Quick build (portable version without installer):**
```bash
npm run build:dir
```

This creates a portable version in `dist/win-unpacked` that doesn't require installation.

## Output Location

After building, you'll find:
- **Installer**: `dist/E-Paper Ebook Reader Setup 1.0.0.exe`
- **Portable version**: `dist/win-unpacked/E-Paper Ebook Reader.exe`

## Installation

### For End Users:

1. Double-click the installer `.exe` file
2. Follow the installation wizard
3. Choose installation directory (default: `C:\Program Files\E-Paper Ebook Reader`)
4. Create desktop shortcut (optional)
5. Click Install

The app will be installed and a shortcut will be created on your desktop and Start Menu.

## Application Features

- **File Menu**: Open PDF files (Ctrl+O)
- **View Menu**: Settings, Fullscreen mode
- **Navigation**: Previous/Next page with arrow keys
- **Keyboard Shortcuts**:
  - `Ctrl+O` - Open PDF
  - `F11` - Toggle fullscreen
  - `Left/Right Arrow` - Navigate pages
  - `Ctrl+Q` - Quit application

## Customization

### Change App Icon

1. Replace `icon.ico` with your custom icon (256x256 recommended)
2. Rebuild the application

### Change App Name

Edit `package.json`:
```json
"productName": "Your App Name"
```

### Change Version

Edit `package.json`:
```json
"version": "1.0.0"
```

## Troubleshooting

### Build Fails

1. **Delete node_modules and reinstall**:
   ```bash
   rmdir /s /q node_modules
   npm install
   ```

2. **Clear Electron cache**:
   ```bash
   npm cache clean --force
   ```

### App Doesn't Start

1. Check if Node.js is installed: `node --version`
2. Reinstall dependencies: `npm install`
3. Run in development mode to see errors: `npm start`

### PDF.js Not Working

The build includes PDF.js automatically. If PDFs don't load:
1. Check internet connection (PDF.js CDN)
2. Or download PDF.js locally and update the path in `script.js`

## Distribution

You can distribute the installer file (`E-Paper Ebook Reader Setup 1.0.0.exe`) to users. They just need to:
1. Download the .exe file
2. Run it
3. Follow installation steps

No additional software required for end users!

## File Size

- Installer: ~150-200 MB (includes Chromium engine)
- Installed size: ~250-300 MB

## Updates

To release a new version:
1. Update version in `package.json`
2. Make your code changes
3. Run `npm run build`
4. Distribute the new installer

## Support

For issues or questions, refer to:
- Electron documentation: https://www.electronjs.org/docs
- Electron Builder: https://www.electron.build/
