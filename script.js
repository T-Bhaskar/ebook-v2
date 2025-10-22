// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class EbookReader {
    constructor() {
        this.pdfDoc = null;
        this.currentPageNum = 1;
        this.totalPages = 0;
        this.scale = 3.2;
        this.isFlipping = false;
        this.settings = {
            background: 'sepia',
            outerBackground: 'light-beige',
            pdfBackground: 'original',
            pdfTextColor: 'original',
            brightness: 1,
            contrast: 1.1,
            fontSize: 1.5,
            fontFamily: 'Crimson Text',
            margins: 40,
            eyeProtection: false
        };
        
        this.isPdfFullscreen = false;
        this.pdfZoomLevel = 1;
        this.isRendering = false;
        this.controlsVisible = true;
        this.scrollTimeout = null;

        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.applyTheme();
    }

    initializeElements() {
        // Main elements
        this.fileInput = document.getElementById('fileInput');
        this.fileBtn = document.getElementById('fileBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.pdfFullscreenBtn = document.getElementById('pdfFullscreenBtn');
        this.exportPdfBtn = document.getElementById('exportPdfBtn');
        
        // Page elements
        this.currentPage = document.getElementById('currentPage');
        this.nextPageEl = document.getElementById('nextPage');
        this.pageContent = document.getElementById('pageContent');
        this.nextPageContent = document.getElementById('nextPageContent');
        this.pageContainer = document.querySelector('.page-container');
        this.bookContainer = document.getElementById('bookContainer');
        
        // Navigation
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentPageNumEl = document.getElementById('currentPageNum');
        this.totalPagesEl = document.getElementById('totalPages');
        this.progressBar = document.getElementById('progressBar');
        
        // Settings controls
        this.colorBtns = document.querySelectorAll('.color-btn');
        this.outerColorBtns = document.querySelectorAll('.outer-color-btn');
        this.pdfBgBtns = document.querySelectorAll('.pdf-bg-btn');
        this.pdfTextBtns = document.querySelectorAll('.pdf-text-btn');
        this.brightnessSlider = document.getElementById('brightnessSlider');
        this.contrastSlider = document.getElementById('contrastSlider');
        this.fontSizeSlider = document.getElementById('fontSizeSlider');
        this.fontSelect = document.getElementById('fontSelect');
        this.marginSlider = document.getElementById('marginSlider');
        this.eyeProtectionMode = document.getElementById('eyeProtectionMode');
        
        // Other elements
        this.bookTitle = document.getElementById('bookTitle');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // PDF Fullscreen elements
        this.pdfFullscreenMode = document.getElementById('pdfFullscreenMode');
        this.pdfFullscreenContent = document.getElementById('pdfFullscreenContent');
        this.pdfFullscreenExit = document.getElementById('pdfFullscreenExit');
        this.pdfFullscreenPrev = document.getElementById('pdfFullscreenPrev');
        this.pdfFullscreenNext = document.getElementById('pdfFullscreenNext');
        this.pdfFullscreenPageNum = document.getElementById('pdfFullscreenPageNum');
        this.pdfFullscreenTotalPages = document.getElementById('pdfFullscreenTotalPages');
        this.pdfZoomSlider = document.getElementById('pdfZoomSlider');
        this.pdfZoomValue = document.getElementById('pdfZoomValue');
    }

    bindEvents() {
        // File handling
        this.fileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Navigation
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        
        // Settings
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.pdfFullscreenBtn.addEventListener('click', () => this.togglePdfFullscreen());
        this.exportPdfBtn.addEventListener('click', () => this.exportCustomizedPdf());
        
        // Color theme buttons
        this.colorBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.changeBackground(e.target.dataset.bg));
        });
        
        // Outer color theme buttons
        this.outerColorBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.changeOuterBackground(e.target.dataset.outerBg));
        });
        
        // PDF color buttons
        this.pdfBgBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.changePdfBackground(e.target.dataset.pdfBg));
        });
        
        this.pdfTextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.changePdfTextColor(e.target.dataset.pdfText));
        });
        
        // Sliders
        this.brightnessSlider.addEventListener('input', (e) => this.changeBrightness(e.target.value));
        this.contrastSlider.addEventListener('input', (e) => this.changeContrast(e.target.value));
        this.fontSizeSlider.addEventListener('input', (e) => this.changeFontSize(e.target.value));
        this.marginSlider.addEventListener('input', (e) => this.changeMargins(e.target.value));
        
        // Font and other settings
        this.fontSelect.addEventListener('change', (e) => this.changeFontFamily(e.target.value));
        this.eyeProtectionMode.addEventListener('change', (e) => this.toggleEyeProtection(e.target.checked));
        
        // PDF Fullscreen controls
        this.pdfFullscreenExit.addEventListener('click', () => this.exitPdfFullscreen());
        this.pdfFullscreenPrev.addEventListener('click', () => this.pdfFullscreenPreviousPage());
        this.pdfFullscreenNext.addEventListener('click', () => this.pdfFullscreenNextPage());
        this.pdfZoomSlider.addEventListener('input', (e) => this.changePdfZoom(e.target.value));
        
        // Zoom buttons (+ and -)
        const zoomInBtn = this.pdfFullscreenMode.querySelector('.fa-search-plus');
        const zoomOutBtn = this.pdfFullscreenMode.querySelector('.fa-search-minus');
        if (zoomInBtn) {
            zoomInBtn.parentElement.style.cursor = 'pointer';
            zoomInBtn.addEventListener('click', () => this.zoomIn());
        }
        if (zoomOutBtn) {
            zoomOutBtn.parentElement.style.cursor = 'pointer';
            zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }
        
        // Double-click to toggle controls
        this.pdfFullscreenContent.addEventListener('dblclick', () => this.toggleControls());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        
        // Touch/mouse gestures
        this.bindGestures();
        
        // Click outside settings to close
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target) && !this.settingsBtn.contains(e.target)) {
                this.settingsPanel.classList.remove('open');
            }
        });

        // Update slider values display
        this.updateSliderValues();
        
        // Handle fullscreen change events (e.g., when user presses ESC)
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && this.isPdfFullscreen) {
                this.exitPdfFullscreen();
            }
        });
    }

    bindGestures() {
        let startX = 0;
        let startY = 0;
        let isSwipe = false;

        this.bookContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipe = false;
        });

        this.bookContainer.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const diffX = Math.abs(e.touches[0].clientX - startX);
            const diffY = Math.abs(e.touches[0].clientY - startY);
            
            if (diffX > diffY && diffX > 50) {
                isSwipe = true;
            }
        });

        this.bookContainer.addEventListener('touchend', (e) => {
            if (!isSwipe) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 100) {
                if (diffX > 0) {
                    this.nextPage();
                } else {
                    this.previousPage();
                }
            }
            
            startX = 0;
            startY = 0;
            isSwipe = false;
        });

        // Mouse click navigation
        this.currentPage.addEventListener('click', (e) => {
            const rect = this.currentPage.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pageWidth = rect.width;
            
            if (clickX > pageWidth * 0.8) {
                this.nextPage();
            } else if (clickX < pageWidth * 0.2) {
                this.previousPage();
            }
        });

        this.nextPageEl.addEventListener('click', () => this.nextPage());
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }

        this.showLoading(true);
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
            this.totalPages = this.pdfDoc.numPages;
            this.currentPageNum = 1;
            
            this.bookTitle.textContent = file.name.replace('.pdf', '');
            this.updatePageInfo();
            this.enableNavigation();
            
            // Enable export button
            this.exportPdfBtn.disabled = false;
            
            await this.renderCurrentPage();
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error loading PDF file. Please try another file.');
            this.showLoading(false);
        }
    }

    async renderPage(pageNum, canvas) {
        if (!this.pdfDoc || pageNum < 1 || pageNum > this.totalPages) return;
        
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            // Apply font size setting to scale
            const effectiveScale = this.scale * this.settings.fontSize;
            const viewport = page.getViewport({ scale: effectiveScale });
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            const context = canvas.getContext('2d');
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            // Apply PDF color transformations
            this.applyPdfColorTransforms(canvas);
            
            
            return true;
        } catch (error) {
            console.error('Error rendering page:', error);
            return false;
        }
    }

    applyPdfColorTransforms(canvas) {
        if (this.settings.pdfBackground === 'original' && this.settings.pdfTextColor === 'original') {
            return; // No transformations needed
        }

        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Define background colors
        const bgColors = {
            original: null,
            white: [255, 255, 255],
            sepia: [244, 241, 234],
            cream: [253, 246, 227],
            'light-gray': [248, 248, 248],
            dark: [45, 45, 45]
        };

        // Define text colors
        const textColors = {
            original: null,
            black: [0, 0, 0],
            'dark-gray': [51, 51, 51],
            brown: [93, 64, 55],
            blue: [21, 101, 192],
            white: [255, 255, 255]
        };

        const targetBg = bgColors[this.settings.pdfBackground];
        const targetText = textColors[this.settings.pdfTextColor];

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];

            // Calculate brightness to determine if it's text or background
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
            
            // If it's a light pixel (likely background) and we want to change background
            if (brightness > 200 && targetBg) {
                data[i] = targetBg[0];     // R
                data[i + 1] = targetBg[1]; // G
                data[i + 2] = targetBg[2]; // B
            }
            // If it's a dark pixel (likely text) and we want to change text color
            else if (brightness < 100 && targetText) {
                data[i] = targetText[0];     // R
                data[i + 1] = targetText[1]; // G
                data[i + 2] = targetText[2]; // B
            }
        }

        // Put the modified image data back
        context.putImageData(imageData, 0, 0);
    }

    async renderCurrentPage() {
        this.pageContent.innerHTML = '';
        
        if (this.pdfDoc) {
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page';
            
            if (await this.renderPage(this.currentPageNum, canvas)) {
                this.pageContent.appendChild(canvas);
            }
        }
        
        this.updatePageInfo();
        this.updateProgress();
    }

    async nextPage() {
        if (this.isFlipping || !this.pdfDoc || this.currentPageNum >= this.totalPages) return;
        
        this.isFlipping = true;
        this.currentPageNum++;
        
        // Add simple fade transition
        this.pageContent.style.opacity = '0.5';
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await this.renderCurrentPage();
        
        this.pageContent.style.opacity = '1';
        this.isFlipping = false;
        this.updateNavigationButtons();
    }

    async previousPage() {
        if (this.isFlipping || !this.pdfDoc || this.currentPageNum <= 1) return;
        
        this.isFlipping = true;
        this.currentPageNum--;
        
        // Add simple fade transition
        this.pageContent.style.opacity = '0.5';
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await this.renderCurrentPage();
        
        this.pageContent.style.opacity = '1';
        this.isFlipping = false;
        this.updateNavigationButtons();
    }

    async animatePageFlip() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 400);
        });
    }

    updatePageInfo() {
        this.currentPageNumEl.textContent = this.currentPageNum;
        this.totalPagesEl.textContent = this.totalPages;
    }

    updateProgress() {
        if (this.totalPages > 0) {
            const progress = (this.currentPageNum / this.totalPages) * 100;
            this.progressBar.style.width = `${progress}%`;
        }
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.currentPageNum <= 1;
        this.nextBtn.disabled = this.currentPageNum >= this.totalPages;
    }

    enableNavigation() {
        this.updateNavigationButtons();
    }

    handleKeyboard(event) {
        if (!this.pdfDoc) return;
        
        // Handle escape key for PDF fullscreen
        if (event.key === 'Escape' && this.isPdfFullscreen) {
            event.preventDefault();
            this.exitPdfFullscreen();
            return;
        }
        
        // Close settings panel on escape
        if (event.key === 'Escape') {
            this.settingsPanel.classList.remove('open');
            return;
        }
        
        // Navigation keys work in both normal and fullscreen mode
        switch(event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                if (this.isPdfFullscreen) {
                    this.pdfFullscreenPreviousPage();
                } else {
                    this.previousPage();
                }
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                event.preventDefault();
                if (this.isPdfFullscreen) {
                    this.pdfFullscreenNextPage();
                } else {
                    this.nextPage();
                }
                break;
            case 'Home':
                event.preventDefault();
                this.goToPage(1);
                if (this.isPdfFullscreen) {
                    this.renderPdfFullscreenPage();
                    this.updatePdfFullscreenButtons();
                }
                break;
            case 'End':
                event.preventDefault();
                this.goToPage(this.totalPages);
                if (this.isPdfFullscreen) {
                    this.renderPdfFullscreenPage();
                    this.updatePdfFullscreenButtons();
                }
                break;
            case 'f':
            case 'F':
                if (event.ctrlKey || event.metaKey) return; // Don't interfere with Ctrl+F
                event.preventDefault();
                this.togglePdfFullscreen();
                break;
        }
    }

    async goToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages || pageNum === this.currentPageNum) return;
        
        this.currentPageNum = pageNum;
        await this.renderCurrentPage();
        this.updateNavigationButtons();
    }

    toggleSettings() {
        this.settingsPanel.classList.toggle('open');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }

    async togglePdfFullscreen() {
        if (!this.pdfDoc) {
            alert('Please load a PDF first');
            return;
        }

        if (this.isPdfFullscreen) {
            this.exitPdfFullscreen();
        } else {
            await this.enterPdfFullscreen();
        }
    }

    async enterPdfFullscreen() {
        this.isPdfFullscreen = true;
        this.pdfFullscreenMode.classList.add('active');
        
        // Update page info
        this.pdfFullscreenPageNum.textContent = this.currentPageNum;
        this.pdfFullscreenTotalPages.textContent = this.totalPages;
        
        // Render current page in fullscreen
        await this.renderPdfFullscreenPage();
        
        // Update button states
        this.updatePdfFullscreenButtons();
        
        // Change button text
        this.pdfFullscreenBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Exit PDF Fullscreen';
        
        // Enter browser fullscreen to hide URL bar and browser UI
        try {
            await this.pdfFullscreenMode.requestFullscreen();
        } catch (err) {
            console.log('Fullscreen request failed:', err);
        }
    }

    exitPdfFullscreen() {
        this.isPdfFullscreen = false;
        this.pdfFullscreenMode.classList.remove('active');
        this.pdfFullscreenContent.innerHTML = '';
        
        // Reset button text
        this.pdfFullscreenBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i> PDF Fullscreen';
        
        // Exit browser fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    async renderPdfFullscreenPage() {
        // Prevent multiple simultaneous renders
        if (this.isRendering) {
            return;
        }
        
        this.isRendering = true;
        
        // Clear any existing content completely
        this.pdfFullscreenContent.innerHTML = '';
        
        if (this.pdfDoc) {
            // Create container for canvas
            const pageContainer = document.createElement('div');
            pageContainer.className = 'pdf-fullscreen-page-container';
            pageContainer.style.position = 'relative';
            pageContainer.style.display = 'flex';
            pageContainer.style.justifyContent = 'center';
            // Use flex-start when zoomed to allow scrolling to top, center when not zoomed
            pageContainer.style.alignItems = this.pdfZoomLevel > 1 ? 'flex-start' : 'center';
            pageContainer.style.width = '100%';
            pageContainer.style.height = '100%';
            pageContainer.style.overflow = 'auto';
            pageContainer.style.background = '#000';
            
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-fullscreen-page';
            canvas.style.display = 'block';
            canvas.style.margin = '0';
            canvas.style.padding = '0';
            
            // Get page and calculate proper scale
            const page = await this.pdfDoc.getPage(this.currentPageNum);
            const viewport = page.getViewport({ scale: 1 });
            
            // Calculate scale to fit screen while maintaining aspect ratio
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // Use full screen width and height, leaving minimal space for controls
            const availableWidth = screenWidth * 0.98;
            const availableHeight = screenHeight * 0.92; // Leave small space for controls
            
            // Calculate scale based on both width and height, use the smaller one
            const scaleX = availableWidth / viewport.width;
            const scaleY = availableHeight / viewport.height;
            const baseScale = Math.min(scaleX, scaleY);
            
            // Apply user zoom level
            const zoomedScale = baseScale * this.pdfZoomLevel;
            
            // Apply a high-quality rendering scale (2x for crisp text on high-DPI screens)
            // Render at 2x, display at 1x for sharp text without blur
            const renderScale = zoomedScale * 2;
            
            const finalViewport = page.getViewport({ scale: renderScale });
            
            // Set canvas internal resolution (high for quality)
            canvas.width = finalViewport.width;
            canvas.height = finalViewport.height;
            
            // Set canvas display size (actual size on screen) - divide by 2 to get baseScale size
            canvas.style.width = `${finalViewport.width / 2}px`;
            canvas.style.height = `${finalViewport.height / 2}px`;
            
            // Only constrain size if not zoomed, otherwise allow scrolling
            if (this.pdfZoomLevel <= 1) {
                canvas.style.maxWidth = '98vw';
                canvas.style.maxHeight = '92vh';
            } else {
                canvas.style.maxWidth = 'none';
                canvas.style.maxHeight = 'none';
            }
            
            // Get context and clear it before rendering
            const context = canvas.getContext('2d', { alpha: false });
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Render the PDF page
            await page.render({ canvasContext: context, viewport: finalViewport }).promise;
            
            // Apply PDF color transformations
            this.applyPdfColorTransforms(canvas);
            
            pageContainer.appendChild(canvas);
            this.pdfFullscreenContent.appendChild(pageContainer);
            
            // Setup scroll-based pagination
            this.setupScrollPagination(pageContainer);
        }
        
        this.isRendering = false;
    }

    async pdfFullscreenNextPage() {
        if (this.isRendering || this.currentPageNum >= this.totalPages) return;
        
        // Disable buttons during render
        this.pdfFullscreenNext.disabled = true;
        this.pdfFullscreenPrev.disabled = true;
        
        this.currentPageNum++;
        this.pdfFullscreenPageNum.textContent = this.currentPageNum;
        await this.renderPdfFullscreenPage();
        this.updatePdfFullscreenButtons();
        
        // Also update main page
        await this.renderCurrentPage();
        this.updateNavigationButtons();
    }

    async pdfFullscreenPreviousPage() {
        if (this.isRendering || this.currentPageNum <= 1) return;
        
        // Disable buttons during render
        this.pdfFullscreenNext.disabled = true;
        this.pdfFullscreenPrev.disabled = true;
        
        this.currentPageNum--;
        this.pdfFullscreenPageNum.textContent = this.currentPageNum;
        await this.renderPdfFullscreenPage();
        this.updatePdfFullscreenButtons();
        
        // Also update main page
        await this.renderCurrentPage();
        this.updateNavigationButtons();
    }

    updatePdfFullscreenButtons() {
        this.pdfFullscreenPrev.disabled = this.currentPageNum <= 1;
        this.pdfFullscreenNext.disabled = this.currentPageNum >= this.totalPages;
    }

    async changePdfZoom(value) {
        this.pdfZoomLevel = parseFloat(value);
        this.pdfZoomValue.textContent = Math.round(this.pdfZoomLevel * 100) + '%';
        
        // Re-render the current page with new zoom level
        if (this.isPdfFullscreen && this.pdfDoc) {
            await this.renderPdfFullscreenPage();
            
            // Scroll to top after zoom to show top content
            const container = this.pdfFullscreenContent.querySelector('.pdf-fullscreen-page-container');
            if (container) {
                container.scrollTop = 0;
                
                // Add scroll listener for auto-pagination
                this.setupScrollPagination(container);
            }
        }
    }

    zoomIn() {
        const newZoom = Math.min(this.pdfZoomLevel + 0.1, 3);
        this.pdfZoomSlider.value = newZoom;
        this.changePdfZoom(newZoom);
    }

    zoomOut() {
        const newZoom = Math.max(this.pdfZoomLevel - 0.1, 0.5);
        this.pdfZoomSlider.value = newZoom;
        this.changePdfZoom(newZoom);
    }

    toggleControls() {
        this.controlsVisible = !this.controlsVisible;
        const controls = this.pdfFullscreenMode.querySelector('.pdf-fullscreen-controls');
        const exitBtn = this.pdfFullscreenMode.querySelector('.pdf-fullscreen-exit');
        
        if (this.controlsVisible) {
            controls.style.opacity = '1';
            controls.style.pointerEvents = 'auto';
            exitBtn.style.opacity = '1';
            exitBtn.style.pointerEvents = 'auto';
        } else {
            controls.style.opacity = '0';
            controls.style.pointerEvents = 'none';
            exitBtn.style.opacity = '0';
            exitBtn.style.pointerEvents = 'none';
        }
    }

    setupScrollPagination(container) {
        // Remove existing listener if any
        if (this.scrollListener) {
            container.removeEventListener('scroll', this.scrollListener);
        }
        
        this.scrollListener = () => {
            // Clear existing timeout
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            
            // Debounce scroll event
            this.scrollTimeout = setTimeout(() => {
                const scrollTop = container.scrollTop;
                const scrollHeight = container.scrollHeight;
                const clientHeight = container.clientHeight;
                
                // Check if scrolled to bottom (with 50px threshold)
                if (scrollTop + clientHeight >= scrollHeight - 50) {
                    // Load next page if available
                    if (this.currentPageNum < this.totalPages && !this.isRendering) {
                        this.pdfFullscreenNextPage();
                    }
                }
                
                // Check if scrolled to top (with 50px threshold)
                if (scrollTop <= 50) {
                    // Load previous page if available
                    if (this.currentPageNum > 1 && !this.isRendering) {
                        this.pdfFullscreenPreviousPage();
                    }
                }
            }, 150); // 150ms debounce
        };
        
        container.addEventListener('scroll', this.scrollListener);
    }

    changeBackground(theme) {
        this.settings.background = theme;
        this.colorBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-bg="${theme}"]`).classList.add('active');
        this.applyTheme();
        this.saveSettings();
    }

    changeOuterBackground(theme) {
        this.settings.outerBackground = theme;
        this.outerColorBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-outer-bg="${theme}"]`).classList.add('active');
        this.applyTheme();
        this.saveSettings();
    }

    async changePdfBackground(theme) {
        this.settings.pdfBackground = theme;
        this.pdfBgBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-pdf-bg="${theme}"]`).classList.add('active');
        
        // Re-render PDF with new background
        if (this.pdfDoc) {
            this.pageContent.style.opacity = '0.7';
            await this.renderCurrentPage();
            this.pageContent.style.opacity = '1';
        }
        
        this.saveSettings();
    }

    async changePdfTextColor(theme) {
        this.settings.pdfTextColor = theme;
        this.pdfTextBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-pdf-text="${theme}"]`).classList.add('active');
        
        // Re-render PDF with new text color
        if (this.pdfDoc) {
            this.pageContent.style.opacity = '0.7';
            await this.renderCurrentPage();
            this.pageContent.style.opacity = '1';
        }
        
        this.saveSettings();
    }

    changeBrightness(value) {
        this.settings.brightness = parseFloat(value);
        this.applyTheme();
        this.updateSliderValues();
        this.saveSettings();
    }

    changeContrast(value) {
        this.settings.contrast = parseFloat(value);
        this.applyTheme();
        this.updateSliderValues();
        this.saveSettings();
    }

    async changeFontSize(value) {
        this.settings.fontSize = parseFloat(value);
        this.updateSliderValues();
        this.saveSettings();
        
        // For PDF content, we need to re-render with new scale
        if (this.pdfDoc) {
            // Show a brief loading state
            this.pageContent.style.opacity = '0.7';
            await this.renderCurrentPage();
            this.pageContent.style.opacity = '1';
        }
        
        this.applyTheme();
    }

    changeFontFamily(family) {
        this.settings.fontFamily = family;
        
        // Apply font family to interface elements
        document.body.style.fontFamily = family;
        document.querySelectorAll('.reader-header, .settings-panel, .navigation-controls').forEach(el => {
            el.style.fontFamily = family;
        });
        
        this.applyTheme();
        this.saveSettings();
    }

    changeMargins(value) {
        this.settings.margins = parseInt(value);
        this.applyTheme();
        this.updateSliderValues();
        this.saveSettings();
    }

    toggleEyeProtection(enabled) {
        this.settings.eyeProtection = enabled;
        this.applyTheme();
        this.saveSettings();
    }

    applyTheme() {
        const pages = document.querySelectorAll('.page');
        const body = document.body;
        
        // Remove existing theme classes
        pages.forEach(page => {
            page.className = page.className.replace(/theme-\w+/g, '');
            page.classList.add(`theme-${this.settings.background}`);
        });

        // Apply page background colors
        const backgrounds = {
            sepia: '#f4f1ea',
            white: '#ffffff',
            cream: '#fdf6e3',
            gray: '#f5f5f5',
            dark: '#2d2d2d'
        };

        const textColors = {
            sepia: '#2c2c2c',
            white: '#000000',
            cream: '#2c2c2c',
            gray: '#2c2c2c',
            dark: '#e0e0e0'
        };

        pages.forEach(page => {
            page.style.background = backgrounds[this.settings.background];
            page.style.color = textColors[this.settings.background];
            page.style.fontFamily = this.settings.fontFamily;
        });

        // Apply outer background colors
        const outerBackgrounds = {
            'light-beige': 'linear-gradient(135deg, #f4f1ea 0%, #e8e4d9 100%)',
            'white': '#ffffff',
            'light-gray': '#f8f8f8',
            'dark-gray': '#3a3a3a',
            'black': '#1a1a1a',
            'warm-brown': 'linear-gradient(135deg, #8b7355 0%, #6d5a42 100%)'
        };

        body.style.background = outerBackgrounds[this.settings.outerBackground];

        // Apply filters
        const filterValue = `
            brightness(${this.settings.brightness})
            contrast(${this.settings.contrast})
            ${this.settings.eyeProtection ? 'sepia(0.1) saturate(0.8)' : ''}
        `;

        this.bookContainer.style.filter = filterValue;

        // Apply font size and margins
        document.querySelectorAll('.page-content').forEach(content => {
            content.style.fontSize = `${24 * this.settings.fontSize}px`;
            content.style.padding = `${this.settings.margins}px`;
        });
    }

    updateSliderValues() {
        document.querySelector('#brightnessSlider + .slider-value').textContent = 
            Math.round(this.settings.brightness * 100) + '%';
        document.querySelector('#contrastSlider + .slider-value').textContent = 
            Math.round(this.settings.contrast * 100) + '%';
        document.querySelector('#fontSizeSlider + .slider-value').textContent = 
            Math.round(this.settings.fontSize * 100) + '%';
        document.querySelector('#marginSlider + .slider-value').textContent = 
            this.settings.margins + 'px';
    }

    saveSettings() {
        localStorage.setItem('ebookReaderSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('ebookReaderSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            
            // Update UI controls
            this.brightnessSlider.value = this.settings.brightness;
            this.contrastSlider.value = this.settings.contrast;
            this.fontSizeSlider.value = this.settings.fontSize;
            this.fontSelect.value = this.settings.fontFamily;
            this.marginSlider.value = this.settings.margins;
            this.eyeProtectionMode.checked = this.settings.eyeProtection;
            
            // Update active color buttons
            this.colorBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-bg="${this.settings.background}"]`)?.classList.add('active');
            
            this.outerColorBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-outer-bg="${this.settings.outerBackground}"]`)?.classList.add('active');
            
            this.pdfBgBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-pdf-bg="${this.settings.pdfBackground}"]`)?.classList.add('active');
            
            this.pdfTextBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-pdf-text="${this.settings.pdfTextColor}"]`)?.classList.add('active');
        }
    }


    showLoading(show) {
        this.loadingOverlay.classList.toggle('show', show);
    }

    async exportCustomizedPdf() {
        if (!this.pdfDoc) {
            alert('Please load a PDF first!');
            return;
        }

        this.showLoading(true);
        
        try {
            const { jsPDF } = window.jspdf;
            
            // Get first page to determine dimensions
            const firstPage = await this.pdfDoc.getPage(1);
            const viewport = firstPage.getViewport({ scale: 1 });
            
            // Create new PDF with same dimensions as original
            const pdf = new jsPDF({
                orientation: viewport.width > viewport.height ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [viewport.width, viewport.height]
            });

            // Process each page
            for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
                // Add new page for all pages except the first
                if (pageNum > 1) {
                    pdf.addPage([viewport.width, viewport.height]);
                }

                // Get the page
                const page = await this.pdfDoc.getPage(pageNum);
                const pageViewport = page.getViewport({ scale: 2 }); // Higher scale for quality

                // Create canvas for this page
                const canvas = document.createElement('canvas');
                canvas.width = pageViewport.width;
                canvas.height = pageViewport.height;

                const context = canvas.getContext('2d', { alpha: false });
                
                // Render the page
                await page.render({
                    canvasContext: context,
                    viewport: pageViewport
                }).promise;

                // Apply all customizations (background, text color, brightness, contrast)
                this.applyPdfColorTransforms(canvas);

                // Convert canvas to image and add to PDF
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                pdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);

                // Update progress (optional - show in console)
                console.log(`Processing page ${pageNum}/${this.totalPages}`);
            }

            // Generate filename
            const fileName = this.bookTitle.textContent.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const timestamp = new Date().toISOString().slice(0, 10);
            
            // Save the PDF
            pdf.save(`${fileName}_customized_${timestamp}.pdf`);
            
            this.showLoading(false);
            alert('PDF exported successfully!');
            
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error exporting PDF. Please try again.');
            this.showLoading(false);
        }
    }
}

// Initialize the ebook reader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EbookReader();
});

// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
});

// Prevent context menu on right click for better UX
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.book-container')) {
        e.preventDefault();
    }
});
