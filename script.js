
function createContactForm(formId) {
    const isAccess = formId === 'access-quote-form';
    const isInline = formId === 'inline-quote-form';
    const prefix = isAccess ? 'access-' : (isInline ? 'inline-' : '');
    
    return `
        <div class="form-group">
            <label for="${prefix}name">Name</label>
            <input type="text" id="${prefix}name" required>
        </div>
        <div class="form-group">
            <label for="${prefix}business">Property / Business Name</label>
            <input type="text" id="${prefix}business" required>
        </div>
        <div class="form-group">
            <label for="${prefix}phone">Phone Number</label>
            <div class="phone-input-wrapper">
                <span class="phone-prefix">+91</span>
                <input type="tel" id="${prefix}phone" class="phone-input" placeholder="10-digit number" pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits" minlength="10" maxlength="10" required>
            </div>
        </div>
        <div class="form-group">
            <label for="${prefix}city">City / Location</label>
            <input type="text" id="${prefix}city" required>
        </div>
        <div class="form-group">
            <label for="${prefix}type">Type of Space</label>
            <select id="${prefix}type" required>
                <option value="" disabled selected>Select an option</option>
                <option value="hotel">Hotel/Resort</option>
                <option value="restaurant">Restaurant/Cafe</option>
                <option value="office">Office Space</option>
                <option value="other">Other</option>
            </select>
        </div>
        <div class="form-group">
            <label for="${prefix}rooms">Approximate number of rooms/spaces</label>
            <input type="number" id="${prefix}rooms" min="1"
                title="Please enter a valid number of rooms (1 or more)" required>
        </div>
        <div class="form-group">
            <label for="${prefix}message">Brief message (optional)</label>
            <textarea id="${prefix}message" rows="3"></textarea>
        </div>
        <div class="form-group checkbox-group">
            <input type="checkbox" id="${prefix}consent" required>
            <label for="${prefix}consent">I agree to be contacted regarding my inquiry</label>
        </div>
        <button type="submit" class="btn btn-primary full-width">Send Inquiry</button>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    function trackEvent(eventName, eventParams = {}) {
        try {
            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, eventParams);
            }
        } catch (e) {
            // Defensive: tracking must never interrupt UI
        }
    }

    function cleanPhotoName(src) {
        try {
            return src.split('/').pop().replace(/\.(webp|jpg|jpeg|png)$/i, '');
        } catch (e) {
            return 'photo';
        }
    }

    function generateAltText(src) {
        try {
            const filename = src.split('/').pop().split('.')[0];
            const parts = filename.split('_');
            const keywords = parts.filter(p => !/^(\d|H\d|L\d|S\d)/.test(p));
            const formatted = keywords.map(k => k.replace(/([a-z])([A-Z])/g, '$1 $2')).join(' ');
            return formatted ? `${formatted} - Professional Photography by Binny House` : 'Professional Hotel & Architectural Photography by Binny House';
        } catch (e) {
            return 'Professional Hotel & Architectural Photography by Binny House';
        }
    }


    const inlineForm = document.getElementById('inline-quote-form');
    if (inlineForm) inlineForm.innerHTML = createContactForm('inline-quote-form');
    
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) quoteForm.innerHTML = createContactForm('quote-form');
    
    const accessForm = document.getElementById('access-quote-form');
    if (accessForm) accessForm.innerHTML = createContactForm('access-quote-form');


    // --- NAVIGATION LOGIC ---
    const navbar = document.getElementById('navbar');
    const hero = document.getElementById('hero');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Show nav only after scrolling past hero
    const navObserverOptions = {
        root: null,
        threshold: 0,
        rootMargin: "-100px 0px 0px 0px"
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }, navObserverOptions);

    if (hero) {
        navObserver.observe(hero);
    }

    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // --- SCROLL REVEAL ANIMATIONS ---
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => el.classList.add('js-reveal'));
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- STAT COUNTERS ---
    const stats = document.querySelectorAll('.stat-number');
    let animatedStats = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedStats) {
                animatedStats = true;
                stats.forEach(stat => {
                    const target = +stat.getAttribute('data-target');
                    const duration = 2000;
                    const step = target / (duration / 16); // 60fps
                    let current = 0;

                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            stat.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            stat.innerText = target;
                        }
                    };
                    updateCounter();
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.getElementById('impact');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // --- MODAL LOGIC ---
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const modalCloses = document.querySelectorAll('.modal-close:not(.gallery-close)');
    const contactForms = document.querySelectorAll('.contact-form');

const focusedElementStack = [];

    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (document.activeElement) {
                focusedElementStack.push(document.activeElement);
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (modalId === 'contact-modal') {
                trackEvent('click_cta_quote');
            } else if (modalId === 'masonry-popup') {
                trackEvent('view_portfolio_gallery');
            } // Prevent scrolling
            
            // Focus first focusable element
            const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length) {
                setTimeout(() => focusable[0].focus(), 50);
            }
        }
    };

    // Track active forms for funnel & abandonment detection
    const formInteractionMap = new Map();

    contactForms.forEach(form => {
        const formId = form.id || 'contact-form';
        const formData = {
            started: false,
            submitted: false,
            completedFields: new Set()
        };
        formInteractionMap.set(formId, formData);

        form.addEventListener('focusin', () => {
            if (!formData.started) {
                formData.started = true;
                trackEvent('form_start', { form_id: formId });
            }
        });

        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => {
                const fieldName = field.id ? field.id.replace(/^(inline-|access-)/, '') : (field.name || 'field');
                const val = field.value.trim();
                if (val.length > 0 && !formData.completedFields.has(fieldName)) {
                    formData.completedFields.add(fieldName);
                    trackEvent('form_field_complete', {
                        form_id: formId,
                        field_name: fieldName,
                        completed_count: formData.completedFields.size
                    });
                }
            });
        });
    });

    const closeModal = (modal) => {
        if (!modal) return;

        // Handle lightbox session closing telemetry
        if (modal.id === 'lightbox-popup') {
            flushPhotoDwell();
            if (lbSessionStartTime > 0) {
                const totalLightboxSec = Math.round((Date.now() - lbSessionStartTime) / 1000);
                trackEvent('lightbox_close', {
                    total_photos_viewed: lbTotalPhotosViewed,
                    total_session_seconds: totalLightboxSec
                });
            }
            lbSessionStartTime = 0;
            lbTotalPhotosViewed = 0;
        }

        // Form abandonment check if modal has an unsubmitted started form
        const formInModal = modal.querySelector('form');
        if (formInModal && formInteractionMap.has(formInModal.id)) {
            const fData = formInteractionMap.get(formInModal.id);
            if (fData.started && !fData.submitted) {
                trackEvent('form_abandon', {
                    form_id: formInModal.id,
                    fields_completed_count: fData.completedFields.size
                });
            }
        }

        modal.classList.remove('active');
        const remainingActive = document.querySelectorAll('.modal.active');
        if (remainingActive.length === 0) {
            document.body.style.overflow = '';
        }
        const prevFocused = focusedElementStack.pop();
        if (prevFocused && typeof prevFocused.focus === 'function') {
            try { prevFocused.focus(); } catch (err) {}
        }
    };

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = trigger.getAttribute('data-target');
            openModal(targetId);
        });
    });

    modalCloses.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeModal(modal);
            }
        });
    });



    // --- INQUIRY / CONTACT FORM EMAIL SYSTEM ---
    const EMAIL_TARGET = ["mailbinnyhouse", "gmail.com"].join("@");

    contactForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            if (!btn) return;

            const originalText = btn.getAttribute('data-original-text') || btn.innerText;
            if (!btn.getAttribute('data-original-text')) {
                btn.setAttribute('data-original-text', originalText);
            }

            // Remove/reset any existing feedback message
            let feedback = form.querySelector('.form-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'form-feedback';
                form.appendChild(feedback);
            }
            feedback.style.display = 'none';
            feedback.className = 'form-feedback';

            // Gather all form field values
            const nameEl = form.querySelector('[id$="name"]');
            const businessEl = form.querySelector('[id$="business"]');
            const phoneEl = form.querySelector('[id$="phone"]');
            const cityEl = form.querySelector('[id$="city"]');
            const typeEl = form.querySelector('[id$="type"]');
            const roomsEl = form.querySelector('[id$="rooms"]');
            const messageEl = form.querySelector('[id$="message"]');

            const visitorName = nameEl ? nameEl.value.trim() : 'Website Visitor';
            const visitorBusiness = businessEl ? businessEl.value.trim() : 'N/A';
            const visitorPhone = phoneEl ? '+91 ' + phoneEl.value.trim() : 'N/A';
            const visitorCity = cityEl ? cityEl.value.trim() : 'N/A';
            const visitorType = typeEl ? (typeEl.options[typeEl.selectedIndex]?.text || typeEl.value) : 'N/A';
            const visitorRooms = roomsEl ? roomsEl.value.trim() : 'N/A';
            const visitorMessage = messageEl && messageEl.value.trim() ? messageEl.value.trim() : 'None provided';

            // Indicate sending state
            btn.innerText = "Sending...";
            btn.disabled = true;

            const payload = {
                "_subject": `New Website Inquiry — ${visitorName}`,
                "_template": "table",
                "_captcha": "false",
                "Name": visitorName,
                "Property / Business Name": visitorBusiness,
                "Phone Number": visitorPhone,
                "City / Location": visitorCity,
                "Type of Space": visitorType,
                "Approximate Number of Rooms/Spaces": visitorRooms,
                "Brief Message": visitorMessage
            };

            try {
                const response = await fetch(`https://formsubmit.co/ajax/${EMAIL_TARGET}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json().catch(() => ({}));

                // Check for successful transmission or pending activation response
                if (response.ok || data.success === "true" || data.success === true || (data.message && data.message.includes("Activation"))) {
                    // SUCCESS
                    if (formInteractionMap.has(form.id)) {
                        formInteractionMap.get(form.id).submitted = true;
                    }
                    trackEvent('generate_lead', {
                        form_id: form.id || 'contact-form',
                        property_type: visitorType || 'unspecified',
                        city: visitorCity || 'unspecified',
                        rooms: visitorRooms || 'unspecified'
                    });
                    btn.innerText = "Thank you! Your inquiry has been submitted successfully.";
                    btn.style.backgroundColor = "#2e7d32";
                    btn.style.borderColor = "#2e7d32";
                    btn.style.color = "#ffffff";

                    feedback.className = 'form-feedback success';
                    feedback.innerText = "Thank you! Your inquiry has been submitted successfully.";
                    feedback.style.display = 'block';

                    setTimeout(() => {
                        const modal = form.closest('.modal');
                        if (modal) {
                            closeModal(modal);
                        }
                        form.reset();
                        btn.innerText = originalText;
                        btn.style = "";
                        btn.disabled = false;
                        feedback.style.display = 'none';

                        if (typeof appendUnselectsToGallery === 'function') {
                            appendUnselectsToGallery();
                        }
                    }, 2500);
                } else {
                    throw new Error(data.message || "Email delivery failed");
                }
            } catch (err) {
                console.error("Submission error:", err);

                // FAILURE
                btn.innerText = "Something went wrong. Please try again.";
                btn.style.backgroundColor = "#d32f2f";
                btn.style.borderColor = "#d32f2f";
                btn.style.color = "#ffffff";

                feedback.className = 'form-feedback error';
                feedback.innerText = "Something went wrong. Please try again.";
                feedback.style.display = 'block';

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style = "";
                    btn.disabled = false;
                }, 3500);
            }
        });
    });

    // --- GALLERY LOGIC ---
    // galleryData is now loaded globally from galleryData.js

    const galleryGrid = document.getElementById('gallery-grid');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Popup Elements
    const galleryPopup = document.getElementById('gallery-popup');
    const popupTabs = document.querySelectorAll('.popup-tab-btn');
    const mainPopupImg = document.getElementById('main-popup-img');
    const thumbStrip = document.getElementById('thumbnail-strip');
    const currentCount = document.getElementById('gallery-current');
    const totalCount = document.getElementById('gallery-total');
    const btnPrev = document.querySelector('.gallery-nav.prev');
    const btnNext = document.querySelector('.gallery-nav.next');
    const btnClosePopup = document.querySelector('.gallery-close');

    let currentCategory = 'hotels';
    let currentIndex = 0;

    // Render Preview Grid
    const renderPreview = (category) => {
        if (!galleryGrid) return;
        const images = galleryData[category];
        galleryGrid.innerHTML = '';

        // Show 8 images in a varied grid layout
        const previewCount = Math.min(8, images.length);
        const previewImages = images.slice(0, previewCount);

        // Define which items span 2 cols for visual variety
        const spanPattern = [true, false, false, false, false, true, false, false]; // items 0 and 5 span 2 cols

        previewImages.forEach((src, index) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            if (spanPattern[index]) div.classList.add('span-2');

            const img = document.createElement('img');
            img.src = src.thumb;
            img.alt = generateAltText(src.thumb);
            img.loading = index > 3 ? 'lazy' : 'eager';
            div.appendChild(img);

            // Add overlay to last item if more images exist
            if (index === previewCount - 1 && images.length > previewCount) {
                const remaining = images.length - previewCount;
                const overlay = document.createElement('div');
                overlay.className = 'more-overlay';
                overlay.innerText = `+${remaining} More`;
                div.appendChild(overlay);
            }

            div.addEventListener('click', () => openGalleryPopup(category, index));
            galleryGrid.appendChild(div);
        });
    };

    // Tab clicks for preview
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-category');
            renderPreview(cat);
        });
    });

    // Initialize preview
    renderPreview('hotels');

    // View Full Portfolio button
    const viewAllBtn = document.getElementById('view-all-gallery');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            const activeTab = document.querySelector('.tab-btn.active');
            const cat = activeTab ? activeTab.getAttribute('data-category') : 'hotels';
            openGalleryPopup(cat, 0);
        });
    }

    // --- FULLSCREEN POPUP LOGIC ---
    const renderPopupThumbnails = (category) => {
        const images = galleryData[category];
        thumbStrip.innerHTML = '';

        images.forEach((src, index) => {
            const div = document.createElement('div');
            div.className = 'thumb-item';
            if (index === currentIndex) div.classList.add('active');

            const img = document.createElement('img');
            img.src = src.thumb;
            img.loading = "lazy";
            div.appendChild(img);

            div.addEventListener('click', () => {
                setPopupImage(index);
            });

            thumbStrip.appendChild(div);
        });
    };

    const setPopupImage = (index) => {
        const images = galleryData[currentCategory];
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;

        currentIndex = index;
        mainPopupImg.src = images[currentIndex].full;
        currentCount.innerText = currentIndex + 1;
        totalCount.innerText = images.length;

        // Preload next image in background for instant Next click
        const nextIdx = (currentIndex + 1) % images.length;
        if (images[nextIdx] && images[nextIdx].full) {
            const imgPreload = new Image();
            imgPreload.src = images[nextIdx].full;
        }

        // Update active thumbnail
        const thumbs = thumbStrip.querySelectorAll('.thumb-item');
        thumbs.forEach(t => t.classList.remove('active'));
        if (thumbs[currentIndex]) {
            thumbs[currentIndex].classList.add('active');
            // Scroll thumbnail into view
            thumbs[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    const openGalleryPopup = (category, index = 0) => {
        currentCategory = category;
        currentIndex = index;

        // Sync popup tabs
        popupTabs.forEach(btn => {
            if (btn.getAttribute('data-category') === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        renderPopupThumbnails(category);
        setPopupImage(index);

        galleryPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Popup Tab Clicks
    popupTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-category');
            const tabName = btn.innerText.trim();
            trackEvent('portfolio_category_tab', { category: tabName });
            if (cat !== currentCategory) {
                currentCategory = cat;
                popupTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderPopupThumbnails(cat);
                setPopupImage(0);
            }
        });
    });

    // Navigation
    btnPrev.addEventListener('click', () => setPopupImage(currentIndex - 1));
    btnNext.addEventListener('click', () => setPopupImage(currentIndex + 1));

    // Close Popup
    btnClosePopup.addEventListener('click', () => closeModal(galleryPopup));

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!galleryPopup.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') setPopupImage(currentIndex - 1);
        if (e.key === 'ArrowRight') setPopupImage(currentIndex + 1);
    });

    // Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    const mainDisplay = document.querySelector('.gallery-main-display');
    if (mainDisplay) {
        mainDisplay.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        mainDisplay.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            setPopupImage(currentIndex + 1); // Swipe left -> next
        }
        if (touchEndX > touchStartX + threshold) {
            setPopupImage(currentIndex - 1); // Swipe right -> prev
        }
    }

    // --- V2 GALLERY LOGIC ---
    const allGalleryImages = [
        ...(galleryData.hotels || []),
        ...(galleryData.commercial || [])
    ];
    const initialImagesCount = allGalleryImages.length;
    let unselectsAppended = false;

    // 1. Render Preview Collage
    const previewCollage = document.getElementById('preview-collage');
    if (previewCollage) {
        previewCollage.innerHTML = '';
        const topImages = allGalleryImages.slice(0, 3);
        topImages.forEach((src) => {
            const img = document.createElement('img');
            img.src = src.thumb;
            img.className = 'collage-item';
            img.loading = 'lazy';
            img.alt = generateAltText(src.thumb);
            previewCollage.appendChild(img);
        });
    }

    // 1.5 Render Moving Background Collage
    const movingBgContainer = document.getElementById('moving-bg-container');
    if (movingBgContainer) {
        movingBgContainer.innerHTML = '';
        const shuffled = [...allGalleryImages].sort(() => 0.5 - Math.random());
        const itemsPerRow = Math.max(1, Math.floor(shuffled.length / 3));
        
        for (let i = 0; i < 3; i++) {
            const row = document.createElement('div');
            row.className = 'moving-bg-row' + (i % 2 !== 0 ? ' reverse' : '');
            
            const rowImages = shuffled.slice(i * itemsPerRow, (i + 1) * itemsPerRow);
            const trackImages = [...rowImages, ...rowImages];
            
            trackImages.forEach(src => {
                if (src && src.thumb) {
                    const img = document.createElement('img');
                    img.src = src.thumb;
                    img.loading = 'lazy';
                    img.alt = generateAltText(src.thumb);
                    row.appendChild(img);
                }
            });
            movingBgContainer.appendChild(row);
        }
    }

    // 4. Lightbox Modal Logic & Photo Dwell Telemetry
    const lightboxPopup = document.getElementById('lightbox-popup');
    const lightboxImg = document.getElementById('lightbox-main-img');
    const lbCurrent = document.getElementById('lightbox-current');
    const lbTotal = document.getElementById('lightbox-total');
    let lbIndex = 0;
    let lbPhotoStartTime = 0;
    let lbSessionStartTime = 0;
    let lbTotalPhotosViewed = 0;

    function flushPhotoDwell() {
        try {
            if (lbPhotoStartTime > 0 && allGalleryImages[lbIndex]) {
                const dwellSec = Math.round((Date.now() - lbPhotoStartTime) / 1000);
                if (dwellSec >= 1) {
                    const photoObj = allGalleryImages[lbIndex];
                    trackEvent('photo_dwell', {
                        photo_name: cleanPhotoName(photoObj.full),
                        photo_index: lbIndex + 1,
                        dwell_seconds: dwellSec
                    });
                }
            }
        } catch (e) {}
        lbPhotoStartTime = 0;
    }

    function openLightbox(index) {
        flushPhotoDwell();
        lbIndex = index;
        lbSessionStartTime = Date.now();
        lbTotalPhotosViewed = 1;
        lbPhotoStartTime = Date.now();

        if (allGalleryImages[index]) {
            trackEvent('view_photo_detail', {
                photo_name: cleanPhotoName(allGalleryImages[index].full),
                photo_index: index + 1,
                total_photos: allGalleryImages.length
            });
        }
        updateLightbox();
        openModal('lightbox-popup');
    }

    function updateLightbox() {
        if (!lightboxImg || allGalleryImages.length === 0) return;
        if (lbIndex < 0) lbIndex = allGalleryImages.length - 1;
        if (lbIndex >= allGalleryImages.length) lbIndex = 0;

        lightboxImg.src = allGalleryImages[lbIndex].full;
        lightboxImg.alt = generateAltText(allGalleryImages[lbIndex].full);
        if (lbCurrent) lbCurrent.innerText = lbIndex + 1;
        if (lbTotal) lbTotal.innerText = allGalleryImages.length;

        // Preload next image
        const nextLbIdx = (lbIndex + 1) % allGalleryImages.length;
        if (allGalleryImages[nextLbIdx] && allGalleryImages[nextLbIdx].full) {
            const imgLbPreload = new Image();
            imgLbPreload.src = allGalleryImages[nextLbIdx].full;
        }
    }

    function navigateLightbox(newIndex, navType = 'button_arrow') {
        flushPhotoDwell();
        lbIndex = newIndex;
        lbTotalPhotosViewed++;
        lbPhotoStartTime = Date.now();

        if (allGalleryImages[lbIndex]) {
            trackEvent('lightbox_nav', {
                action: navType,
                photo_name: cleanPhotoName(allGalleryImages[lbIndex].full),
                photo_index: lbIndex + 1
            });
        }
        updateLightbox();
    }

    const lbPrev = document.querySelector('.lightbox-nav.prev');
    const lbNext = document.querySelector('.lightbox-nav.next');

    if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(lbIndex - 1, 'prev_button'); });
    if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(lbIndex + 1, 'next_button'); });

    if (lightboxPopup) {
        lightboxPopup.addEventListener('click', (e) => {
            if (e.target.classList.contains('lightbox-popup-content') ||
                e.target.classList.contains('lightbox-main-display') ||
                e.target.classList.contains('lightbox-image-container')) {
                closeModal(lightboxPopup);
            }
        });

        let lbTouchStartX = 0;
        let lbTouchEndX = 0;
        const lbMainDisplay = lightboxPopup.querySelector('.lightbox-main-display');
        if (lbMainDisplay) {
            lbMainDisplay.addEventListener('touchstart', e => {
                lbTouchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            lbMainDisplay.addEventListener('touchend', e => {
                lbTouchEndX = e.changedTouches[0].screenX;
                const threshold = 40;
                if (lbTouchEndX < lbTouchStartX - threshold) {
                    navigateLightbox(lbIndex + 1, 'touch_swipe');
                } else if (lbTouchEndX > lbTouchStartX + threshold) {
                    navigateLightbox(lbIndex - 1, 'touch_swipe');
                }
            }, { passive: true });
        }
    }

    // 2. Render Masonry Grid
    function buildMasonryGrid(forceRebuild = false) {
        const masonryGrid = document.getElementById('masonry-grid');
        if (!masonryGrid) return;
        
        let numCols = 3;
        if (window.innerWidth < 600) numCols = 1;
        else if (window.innerWidth < 900) numCols = 2;
        
        const currentCols = masonryGrid.querySelectorAll('.masonry-col');
        if (!forceRebuild && currentCols.length === numCols && currentCols.length > 0) return;
        
        masonryGrid.innerHTML = '';
        const cols = [];
        for (let i = 0; i < numCols; i++) {
            const col = document.createElement('div');
            col.className = 'masonry-col';
            cols.push(col);
            masonryGrid.appendChild(col);
        }

        allGalleryImages.forEach((src, index) => {
            const div = document.createElement('div');
            div.className = 'masonry-item';
            if (unselectsAppended && index >= initialImagesCount) {
                div.classList.add('revealed-new');
            }
            const img = document.createElement('img');
            img.src = src.thumb;
            img.loading = 'lazy';
            img.alt = generateAltText(src.thumb);
            div.appendChild(img);

            div.addEventListener('click', () => {
                openLightbox(index);
            });
            cols[index % numCols].appendChild(div);
        });
    }

    buildMasonryGrid();
    
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            buildMasonryGrid();
        }, 250);
    });

    // Unselects Append Logic
    window.appendUnselectsToGallery = function () {
        if (unselectsAppended || !galleryData.unselects || galleryData.unselects.length === 0) {
            openModal('masonry-popup');
            return;
        }

        unselectsAppended = true;
        galleryData.unselects.forEach((src) => {
            allGalleryImages.push(src);
        });
        
        buildMasonryGrid(true);
        
        const newItems = document.querySelectorAll('.revealed-new');
        newItems.forEach((item, idx) => {
            item.style.animationDelay = `${(idx % 12) * 0.08}s`;
        });

        const accessBtn = document.getElementById('access-full-portfolio');
        if (accessBtn) {
            accessBtn.style.display = 'none';
        }

        openModal('masonry-popup');

        setTimeout(() => {
            const scrollArea = document.querySelector('.masonry-scroll-area');
            if (scrollArea) {
                scrollArea.scrollBy({ top: 150, behavior: 'smooth' });
            }
        }, 100);
    };

    // 3. Masonry Modal Trigger Logic
    const openMasonryBtn = document.getElementById('open-masonry-btn');
    if (openMasonryBtn) {
        openMasonryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal('masonry-popup');
        });
    }

    const collageWrapper = document.getElementById('preview-collage-wrapper');
    if (collageWrapper) {
        collageWrapper.addEventListener('click', () => {
            openModal('masonry-popup');
        });
    }

    // Access Full Portfolio Button
    const accessFullPortfolioBtn = document.getElementById('access-full-portfolio');
    if (accessFullPortfolioBtn) {
        accessFullPortfolioBtn.addEventListener('click', () => {
            openModal('access-modal');
        });
    }
    


    // Ensure keyboard navigation works for modals and lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const lightbox = document.getElementById('lightbox-popup');
            const accessModal = document.getElementById('access-modal');
            const contactModal = document.getElementById('contact-modal');
            const masonry = document.getElementById('masonry-popup');

            if (lightbox && lightbox.classList.contains('active')) {
                closeModal(lightbox);
            } else if (accessModal && accessModal.classList.contains('active')) {
                closeModal(accessModal);
            } else if (contactModal && contactModal.classList.contains('active')) {
                closeModal(contactModal);
            } else if (masonry && masonry.classList.contains('active')) {
                closeModal(masonry);
            } else {
                const activeModals = document.querySelectorAll('.modal.active');
                if (activeModals.length > 0) {
                    closeModal(activeModals[activeModals.length - 1]);
                }
            }
        }
        if (e.key === 'Tab') {
            const activeModal = Array.from(modals).find(m => m.classList.contains('active'));
            if (activeModal) {
                const focusable = activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable.length) {
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        }
        if (lightboxPopup && lightboxPopup.classList.contains('active')) {
            if (e.key === 'ArrowLeft') { navigateLightbox(lbIndex - 1, 'keyboard_arrow'); }
            if (e.key === 'ArrowRight') { navigateLightbox(lbIndex + 1, 'keyboard_arrow'); }
        }
    });

    // --- BEFORE/AFTER SLIDER (Hidden by default, but functional) ---
    const baSlider = document.getElementById('ba-slider');
    const baAfterImage = document.querySelector('.after-image');
    const baSliderLine = document.querySelector('.slider-line');
    let sliderInteracted = false;

    if (baSlider && baAfterImage && baSliderLine) {
        baSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            baAfterImage.style.clipPath = `polygon(${val}% 0, 100% 0, 100% 100%, ${val}% 100%)`;
            baSliderLine.style.left = `${val}%`;

            if (!sliderInteracted) {
                sliderInteracted = true;
                trackEvent('slider_interaction', {
                    component: 'ota_comparison_slider',
                    value: val
                });
            }
        });
    }

    // --- WHATSAPP & PHONE TELEMETRY ---
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', () => {
            const source = link.closest('.footer') ? 'footer'
                : link.closest('.modal') ? 'contact_modal'
                : link.id === 'whatsapp-float' ? 'floating_button'
                : 'unknown';
            trackEvent('click_whatsapp', {
                source: source,
                link_url: link.href
            });
        });
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('click_phone_call', {
                phone_number: link.href.replace('tel:', '')
            });
        });
    });

    // --- GLOBAL BUTTON & CTA TELEMETRY ---
    document.addEventListener('click', (e) => {
        try {
            const target = e.target.closest('a, button, .btn, .modal-trigger, .whatsapp-btn, #whatsapp-float, .popup-tab-btn');
            if (!target) return;

            const text = (target.innerText || target.getAttribute('aria-label') || target.title || '').trim().replace(/\s+/g, ' ');
            const id = target.id || '';
            const cls = typeof target.className === 'string' ? target.className : '';
            const parentSection = target.closest('section, header, footer, .modal');
            const sectionId = parentSection ? (parentSection.id || parentSection.className.split(' ')[0]) : 'page';

            let ctaType = 'button_click';
            let destination = '';

            if (target.getAttribute('data-target')) {
                ctaType = 'modal_open_trigger';
                destination = target.getAttribute('data-target');
            } else if (target.href && target.href.includes('wa.me')) {
                ctaType = 'whatsapp_click';
                destination = target.href;
            } else if (target.href && target.href.startsWith('tel:')) {
                ctaType = 'phone_call_click';
                destination = target.href;
            } else if (target.classList.contains('popup-tab-btn')) {
                ctaType = 'category_tab_switch';
                destination = text;
            } else if (target.getAttribute('type') === 'submit') {
                ctaType = 'form_submit_button';
            }

            trackEvent('cta_click', {
                button_text: text.slice(0, 50),
                button_id: id,
                button_class: cls.slice(0, 50),
                section_id: sectionId,
                cta_type: ctaType,
                destination: destination.slice(0, 100)
            });
        } catch (err) {}
    }, { passive: true });

    // --- SECTION DWELL TIME TELEMETRY ---
    const sectionIds = ['hero', 'problem', 'impact', 'portfolio-v2', 'why-us', 'process', 'trusted', 'investment', 'inline-contact'];
    const sectionTimers = {};
    const viewedSections = new Set();

    function formatSectionTitle(id) {
        const map = {
            'hero': 'Hero & Value Prop',
            'problem': 'OTA Photo Comparison',
            'impact': 'Revenue & Booking Impact',
            'portfolio-v2': 'See the Work Gallery',
            'why-us': 'Why Binny House Advantages',
            'process': 'Step-by-Step Process',
            'trusted': 'Trusted Brands Marquee',
            'investment': 'Pricing & ROI Package',
            'inline-contact': 'Inline Quote Form'
        };
        return map[id] || id;
    }

    function flushSectionDwell(id) {
        try {
            if (!sectionTimers[id] || !sectionTimers[id].start) return;
            const dwellMs = Date.now() - sectionTimers[id].start;
            sectionTimers[id].total = (sectionTimers[id].total || 0) + dwellMs;
            sectionTimers[id].start = null;

            const dwellSeconds = Math.round(dwellMs / 1000);
            if (dwellSeconds >= 2) {
                trackEvent('section_dwell', {
                    section_id: id,
                    section_name: formatSectionTitle(id),
                    dwell_seconds: dwellSeconds
                });
            }
        } catch (e) {}
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            if (!id) return;
            if (entry.isIntersecting) {
                if (!viewedSections.has(id)) {
                    viewedSections.add(id);
                    trackEvent('section_view', {
                        section_id: id,
                        section_name: formatSectionTitle(id)
                    });
                }
                if (document.visibilityState === 'visible') {
                    sectionTimers[id] = sectionTimers[id] || { total: 0 };
                    sectionTimers[id].start = Date.now();
                }
            } else {
                flushSectionDwell(id);
            }
        });
    }, { threshold: 0.35 });

    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });

    // VisibilityChange pause/resume
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            sectionIds.forEach(id => flushSectionDwell(id));
            flushPhotoDwell();
        } else if (document.visibilityState === 'visible') {
            sectionIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
                    if (inView) {
                        sectionTimers[id] = sectionTimers[id] || { total: 0 };
                        sectionTimers[id].start = Date.now();
                    }
                }
            });
            if (lightboxPopup && lightboxPopup.classList.contains('active')) {
                lbPhotoStartTime = Date.now();
            }
        }
    });

    // --- WHATSAPP FLOATING BUTTON VISIBILITY ---
    const waFloat = document.getElementById('whatsapp-float');
    if (waFloat && hero) {
        const waObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    waFloat.classList.add('visible');
                } else {
                    waFloat.classList.remove('visible');
                }
            });
        }, {
            root: null,
            threshold: 0,
            rootMargin: "-80px 0px 0px 0px"
        });
        waObserver.observe(hero);
    }

    // --- SCROLL DEPTH MILESTONES ---
    const scrollMilestones = [25, 50, 75, 90, 100];
    const firedMilestones = new Set();
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        scrollMilestones.forEach(milestone => {
            if (scrollPercent >= milestone && !firedMilestones.has(milestone)) {
                firedMilestones.add(milestone);
                trackEvent('scroll_depth', { percent: milestone });
            }
        });
    }, { passive: true });

    // --- ENGAGED TIME CHECKPOINTS ---
    const timeCheckpoints = [30, 60, 120, 300];
    timeCheckpoints.forEach(seconds => {
        setTimeout(() => {
            if (document.visibilityState === 'visible') {
                trackEvent('engaged_time', { seconds: seconds });
            }
        }, seconds * 1000);
    });

});
