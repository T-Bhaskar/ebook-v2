# E-Paper Ebook Reader

A beautiful, eye-friendly PDF reader that mimics the experience of reading on paper with natural page-turning animations and customizable reading settings.

## Features

### 📖 **Paper-like Reading Experience**
- E-paper inspired design with natural color schemes
- Smooth page flip animations that feel like turning real book pages
- Book spine visual effect for authentic reading experience
- Eye-friendly color themes (Sepia, White, Cream, Gray, Dark)

### 🎨 **Customizable Reading Settings**
- **Background Colors**: 5 different themes optimized for long reading sessions
- **Brightness Control**: Adjust screen brightness from 30% to 150%
- **Contrast Control**: Fine-tune contrast from 50% to 200%
- **Font Size**: Scale text from 80% to 200%
- **Font Family**: Choose from premium reading fonts (Crimson Text, Source Serif Pro, Georgia, Times New Roman)
- **Page Margins**: Adjustable margins from 20px to 100px
- **Eye Protection Mode**: Reduces blue light and applies sepia filter

### 🚀 **Navigation & Controls**
- **Keyboard Navigation**: Arrow keys, spacebar, Home/End keys
- **Touch Gestures**: Swipe left/right on mobile devices
- **Mouse Navigation**: Click on page edges to navigate
- **Progress Bar**: Visual reading progress indicator
- **Page Counter**: Current page / Total pages display

### 💡 **Smart Features**
- **PDF.js Integration**: Renders PDFs directly in the browser
- **Page Preloading**: Smooth navigation with preloaded next page
- **Settings Persistence**: Your preferences are saved automatically
- **Fullscreen Mode**: Distraction-free reading experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## How to Use

1. **Open the Application**: Double-click `index.html` or serve it through a web server
2. **Load a PDF**: Click "Open PDF" button and select your PDF file
3. **Navigate Pages**: 
   - Use arrow keys or click page edges
   - Swipe on touch devices
   - Use the navigation buttons at the bottom
4. **Customize Settings**: Click the settings gear icon to adjust:
   - Background color for comfort
   - Brightness and contrast
   - Font size and family
   - Page margins
   - Enable eye protection mode
5. **Fullscreen Reading**: Click the expand icon for immersive reading

## Keyboard Shortcuts

- **Arrow Left/Up**: Previous page
- **Arrow Right/Down/Space**: Next page
- **Home**: Go to first page
- **End**: Go to last page
- **Escape**: Close settings panel

## Browser Compatibility

- Chrome/Chromium (Recommended)
- Firefox
- Safari
- Edge

## Technical Details

- **PDF Rendering**: PDF.js library for client-side PDF processing
- **Animations**: CSS3 transforms and transitions for smooth page flips
- **Storage**: LocalStorage for settings persistence
- **Responsive**: CSS Grid and Flexbox for adaptive layouts
- **Performance**: Canvas-based rendering with page preloading

## File Structure

```
Ebook Reader/
├── index.html          # Main application file
├── styles.css          # All styling and animations
├── script.js           # JavaScript functionality
└── README.md          # This documentation
```

## Tips for Best Reading Experience

1. **Choose the Right Theme**: 
   - Sepia for warm, paper-like feel
   - White for high contrast
   - Dark for low-light reading

2. **Adjust Brightness**: Lower brightness in dark environments to reduce eye strain

3. **Enable Eye Protection**: Reduces blue light for extended reading sessions

4. **Optimize Font Size**: Adjust based on your screen size and reading distance

5. **Use Fullscreen**: Hide browser UI for distraction-free reading

## Troubleshooting

**PDF won't load?**
- Ensure the PDF file is not corrupted
- Try a different PDF file
- Check browser console for error messages

**Page flips are slow?**
- Large PDF files may take time to render
- Consider using smaller PDF files for better performance

**Settings not saving?**
- Ensure your browser allows localStorage
- Check if you're in private/incognito mode

## Future Enhancements

- Bookmarks and annotations
- Text search functionality
- Multiple document tabs
- Reading statistics
- Cloud storage integration
- Text-to-speech functionality

---

**Enjoy your paper-like digital reading experience!** 📚
