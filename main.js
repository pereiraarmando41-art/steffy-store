/**
 * ============================================================
 * STEFYY STORE — OFFICIAL JAVASCRIPT
 * Luxury Fashion E-Commerce Platform
 * Libraries: GSAP, ScrollTrigger, Lenis, SplitType
 * ============================================================
 */

/* ──────────────────────────────────────────────────────────
   0. CORE INIT & ANIMATION BOOTSTRAP
   ────────────────────────────────────────────────────────── */
function initCore() {
  initNav();             // Navigation scroll spy + mobile drawer
  initCatalogFilter();   // Category filter tabs for clothing
  initProductVariants(); // Size pills, color swatches & card buy buttons
  initCheckoutForm();    // Interactive order summary & WhatsApp link generator
}

function initAnimationsWhenReady() {
  setTimeout(() => {
    try {
      if (typeof gsap !== 'undefined') {
        if (typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
        }
        initLoader();
        initCursor();
        initSignatureImageAnimations();
        initTestimonials();
      } else {
        // Fallback if GSAP is unavailable
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('is-hidden');
        document.body.style.overflow = '';
      }
    } catch (err) {
      console.warn('Animation initialization notice:', err);
    }
  }, 250);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCore();
    initAnimationsWhenReady();
  });
} else {
  initCore();
  initAnimationsWhenReady();
}

/* ──────────────────────────────────────────────────────────
   1. PAGE LOADER
   ────────────────────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loader-fill');

  if (!loader || !fill) {
    initLenis();
    initAnimations();
    return;
  }

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 22 + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      fill.style.width = '100%';

      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.classList.add('is-hidden');
            document.body.style.overflow = '';
            initLenis();
            initAnimations();
          }
        });
      }, 350);
    } else {
      fill.style.width = progress + '%';
    }
  }, 100);

  document.body.style.overflow = 'hidden';
}

/* ──────────────────────────────────────────────────────────
   2. LENIS SMOOTH SCROLL
   ────────────────────────────────────────────────────────── */
let lenisInstance;

function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 1.8,
  });

  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenisInstance.scrollTo(target, {
          offset: -85,
          duration: 1.3,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
        closeMobileMenu();
      }
    });
  });
}

/* ──────────────────────────────────────────────────────────
   3. ALL SCROLL ANIMATIONS (GSAP + ScrollTrigger + SplitType)
   ────────────────────────────────────────────────────────── */
function initAnimations() {
  animateHeroEntrance();
  initTextReveal();
  initFadeReveal();
  initSlideUpReveal();
  initClipReveal();
  initHeroParallax();
  initAtmosphereParallax();
  initMagneticButtons();
  initGalleryReveal();
  initCatalogCardsReveal();
}

/* ── A. Hero entrance ─────────────────────────────────────── */
function animateHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.1 });

  // Hero image scale in
  tl.fromTo('#hero-img',
    { scale: 1.15 },
    { scale: 1, duration: 1.8, ease: 'power3.out' }
  );

  // Overlay fade
  tl.fromTo('.hero-overlay',
    { opacity: 0 },
    { opacity: 1, duration: 1.2, ease: 'power2.out' },
    '-=1.8'
  );

  // Eyebrow
  tl.fromTo('.hero-eyebrow',
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    '-=0.7'
  );

  // Hero title lines
  const titleLines = document.querySelectorAll('.hero-title-line');
  if (titleLines.length > 0 && typeof SplitType !== 'undefined') {
    titleLines.forEach(line => {
      new SplitType(line, { types: 'words' });
    });

    const words = document.querySelectorAll('.hero-title-line .word');
    tl.fromTo(words,
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 1.0,
        ease: 'power4.out',
        stagger: 0.05
      },
      '-=0.5'
    );
  }

  // Tagline
  tl.fromTo('.hero-tagline',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    '-=0.5'
  );

  // CTA buttons
  tl.fromTo('.hero-cta .btn',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 },
    '-=0.5'
  );

  // Trust badges bar
  tl.fromTo('.hero-badges',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
    '-=0.3'
  );

  // Scroll indicator
  tl.fromTo('#scroll-indicator',
    { opacity: 0 },
    { opacity: 1, duration: 0.6, ease: 'power2.out' },
    '-=0.3'
  );
}

/* ── B. Text split reveal ────────────────────────────────── */
function initTextReveal() {
  if (typeof SplitType === 'undefined') return;

  const textEls = document.querySelectorAll('.reveal-text:not(.hero *)');

  textEls.forEach(el => {
    const splitType = el.dataset.split || 'words';
    const split = new SplitType(el, { types: splitType });
    const targets = splitType === 'chars' ? split.chars : split.words;

    if (!targets || targets.length === 0) return;

    targets.forEach(t => {
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.verticalAlign = 'bottom';
      t.parentNode.insertBefore(wrapper, t);
      wrapper.appendChild(t);
    });

    gsap.fromTo(targets,
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.85,
        ease: 'power4.out',
        stagger: splitType === 'chars' ? 0.02 : 0.05,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

/* ── C. Fade reveal ──────────────────────────────────────── */
function initFadeReveal() {
  const fadeEls = document.querySelectorAll('.reveal-fade:not(.hero *)');

  fadeEls.forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

/* ── D. Slide-up reveal ─────────────────────────────────── */
function initSlideUpReveal() {
  const upEls = document.querySelectorAll('.reveal-up');

  upEls.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: (i % 3) * 0.07,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

/* ── E. Clip reveal (images) ────────────────────────────── */
function initClipReveal() {
  const clipEls = document.querySelectorAll('.clip-reveal');

  clipEls.forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );

    const img = el.querySelector('img');
    if (img) {
      gsap.fromTo(img,
        { scale: 1.12 },
        {
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        }
      );
    }
  });
}

/* ── F. Hero parallax ───────────────────────────────────── */
function initHeroParallax() {
  const heroWrap = document.getElementById('hero-img-wrap');
  if (!heroWrap) return;

  gsap.to(heroWrap, {
    yPercent: 16,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    }
  });
}

/* ── G. Atmosphere parallax ─────────────────────────────── */
function initAtmosphereParallax() {
  const atmoWrap = document.querySelector('.atmosphere-image-wrap');
  if (!atmoWrap) return;

  gsap.to(atmoWrap, {
    yPercent: 14,
    ease: 'none',
    scrollTrigger: {
      trigger: '.atmosphere',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.2
    }
  });
}

/* ── H. Editorial image animations ──────────────────────── */
function initSignatureImageAnimations() {
  const signatureItems = document.querySelectorAll('.signature-item');

  signatureItems.forEach(item => {
    const wrap = item.querySelector('.signature-image-wrap');
    const img  = item.querySelector('.signature-img');
    if (!wrap || !img) return;

    gsap.fromTo(img,
      { yPercent: -8, scale: 1.14 },
      {
        yPercent: 8,
        scale: 1.03,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      }
    );
  });
}

/* ── I. Magnetic button effect ──────────────────────────── */
function initMagneticButtons() {
  const magneticEls = document.querySelectorAll('.magnetic');

  magneticEls.forEach(el => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });

    let rafId   = null;
    let targetX = 0;
    let targetY = 0;

    el.addEventListener('mousemove', (e) => {
      const rect    = el.getBoundingClientRect();
      const cx      = rect.left + rect.width  / 2;
      const cy      = rect.top  + rect.height / 2;
      const dx      = e.clientX - cx;
      const dy      = e.clientY - cy;
      const maxDist = Math.max(rect.width, rect.height) * 0.7;
      const pull    = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / maxDist);
      targetX = dx * pull * 0.35;
      targetY = dy * pull * 0.35;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          xTo(targetX);
          yTo(targetY);
          rafId = null;
        });
      }
    });

    el.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1.1, 0.5)' });
    });
  });
}

/* ── J. Lookbook gallery stagger ────────────────────────── */
function initGalleryReveal() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  gsap.fromTo(galleryItems,
    { opacity: 0, y: 35, scale: 0.97 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: '#gallery-masonry',
        start: 'top 85%',
        once: true
      }
    }
  );
}

/* ── K. Catalog cards stagger ───────────────────────────── */
function initCatalogCardsReveal() {
  const cards = document.querySelectorAll('.menu-card');
  if (!cards.length) return;

  gsap.fromTo(cards,
    { opacity: 0, y: 35 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: {
        trigger: '#menu-grid',
        start: 'top 88%',
        once: true
      }
    }
  );
}

/* ──────────────────────────────────────────────────────────
   4. CUSTOM CURSOR
   ────────────────────────────────────────────────────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  if (window.matchMedia('(hover: hover)').matches) {
    cursor.style.display = 'block';

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const dot  = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');

    function animateCursor() {
      dotX  += (mouseX - dotX) * 0.85;
      dotY  += (mouseY - dotY) * 0.85;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (dot)  { dot.style.transform  = `translate(${dotX}px, ${dotY}px)`; }
      if (ring) { ring.style.transform = `translate(${ringX}px, ${ringY}px)`; }

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverTargets = 'a, button, .menu-tab, .btn, .menu-card, .size-pill, .color-dot, .gallery-item, .testimonial-btn, .payment-card';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    document.querySelectorAll('p, h1, h2, h3, blockquote').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
    });

    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  } else {
    cursor.style.display = 'none';
  }
}

/* ──────────────────────────────────────────────────────────
   5. NAVIGATION & MOBILE DRAWER
   ────────────────────────────────────────────────────────── */
function initNav() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn   = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!navbar) return;

  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const navLinks  = Array.from(document.querySelectorAll('.nav-link'));
  let scrollRAF   = null;
  let lastScrollY = -1;

  const handleScroll = () => {
    if (scrollRAF) return;
    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = null;
      const y = window.scrollY;
      if (y === lastScrollY) return;
      lastScrollY = y;

      navbar.classList.toggle('scrolled', y > 50);

      let current = '';
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].getBoundingClientRect().top < 220) {
          current = sections[i].id;
          break;
        }
      }
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileMenu);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function openMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburger  = document.getElementById('nav-hamburger');
  if (!mobileMenu) return;
  mobileMenu.classList.add('open');
  hamburger && hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  gsap.fromTo('.mobile-link',
    { opacity: 0, x: -20 },
    {
      opacity: 1, x: 0,
      duration: 0.45,
      ease: 'power3.out',
      stagger: 0.06,
      delay: 0.12
    }
  );
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburger  = document.getElementById('nav-hamburger');
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  hamburger && hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────
   6. CATALOG FILTER TABS
   ────────────────────────────────────────────────────────── */
function initCatalogFilter() {
  const tabs  = document.querySelectorAll('.menu-tab');
  const cards = document.querySelectorAll('.menu-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;

      cards.forEach((card, i) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.style.display = '';
          gsap.fromTo(card,
            { opacity: 0, y: 20, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', delay: i * 0.03 }
          );
        } else {
          gsap.to(card, {
            opacity: 0, y: 10,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => { card.style.display = 'none'; }
          });
        }
      });
    });
  });
}

/* ──────────────────────────────────────────────────────────
   7. PRODUCT CARD VARIANTS & QUICK ORDER SELECTOR
   ────────────────────────────────────────────────────────── */
function initProductVariants() {
  const cards = document.querySelectorAll('.menu-card');

  cards.forEach(card => {
    // Size pills selection inside card
    const sizePills = card.querySelectorAll('.size-pill');
    sizePills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        sizePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // Color dots selection inside card
    const colorDots = card.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      });
    });

    // Buy button on card: loads product into checkout and scrolls smoothly
    const buyBtn = card.querySelector('.btn-order-trigger, .btn-card-buy');
    if (buyBtn) {
      buyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const title       = card.dataset.title || card.querySelector('.menu-card-title')?.textContent.trim();
        const price       = card.dataset.price ? parseInt(card.dataset.price, 10) : 0;
        const imgEl       = card.querySelector('.menu-card-img');
        const imgSrc      = imgEl ? imgEl.src : '';
        const activeSize  = card.querySelector('.size-pill.active')?.dataset.size || 'M';
        const activeColor = card.querySelector('.color-dot.active')?.dataset.color || 'Negro';

        selectProductForCheckout({
          title,
          price,
          imgSrc,
          size: activeSize,
          color: activeColor
        });

        // Smooth scroll to checkout section
        const checkoutSection = document.getElementById('checkout');
        if (checkoutSection) {
          if (lenisInstance) {
            lenisInstance.scrollTo(checkoutSection, { offset: -70, duration: 1.2 });
          } else {
            checkoutSection.scrollIntoView({ behavior: 'smooth' });
          }
        }

        showToast(`✨ ¡${title} agregado a tu orden!`, 'info');
      });
    }
  });
}

/**
 * Updates checkout form and dynamic order summary card
 */
function selectProductForCheckout({ title, price, imgSrc, size, color }) {
  const productSelect = document.getElementById('order-product');
  const sizeSelect    = document.getElementById('order-size');
  const colorInput    = document.getElementById('order-color');

  // Match or select option in product dropdown
  if (productSelect && title) {
    let matched = false;
    for (let i = 0; i < productSelect.options.length; i++) {
      if (productSelect.options[i].value.toLowerCase().includes(title.toLowerCase()) ||
          title.toLowerCase().includes(productSelect.options[i].value.toLowerCase())) {
        productSelect.selectedIndex = i;
        matched = true;
        break;
      }
    }
    // If not found, create or set value
    if (!matched) {
      const opt = new Option(title, title, true, true);
      if (price) opt.dataset.price = price;
      if (imgSrc) opt.dataset.img = imgSrc;
      productSelect.add(opt);
    }
  }

  // Update Size select
  if (sizeSelect && size) {
    for (let i = 0; i < sizeSelect.options.length; i++) {
      if (sizeSelect.options[i].value === size) {
        sizeSelect.selectedIndex = i;
        break;
      }
    }
  }

  // Update Color input
  if (colorInput && color) {
    colorInput.value = color;
  }

  // Update Order Summary Card
  updateOrderSummary();
}

/**
 * Updates the summary preview on the left side of the checkout
 */
function updateOrderSummary() {
  const productSelect  = document.getElementById('order-product');
  const sizeSelect     = document.getElementById('order-size');
  const colorInput     = document.getElementById('order-color');
  const paymentMethod  = document.querySelector('input[name="payment_method"]:checked')?.value || 'Efectivo / Transferencia (10% OFF)';

  const summaryTitle    = document.getElementById('summary-title');
  const summarySize     = document.getElementById('summary-size');
  const summaryColor    = document.getElementById('summary-color');
  const summaryImg      = document.getElementById('summary-img');
  const summaryOrigPrice = document.getElementById('summary-original-price');
  const summaryTotalPrice = document.getElementById('summary-total-price');
  const summaryDiscountTag = document.getElementById('summary-discount-tag');

  if (!productSelect) return;

  const selectedOpt = productSelect.options[productSelect.selectedIndex];
  const title = selectedOpt ? selectedOpt.value : 'Prenda seleccionada';
  const price = selectedOpt && selectedOpt.dataset.price ? parseInt(selectedOpt.dataset.price, 10) : 48900;
  const img   = selectedOpt && selectedOpt.dataset.img ? selectedOpt.dataset.img : '';
  const size  = sizeSelect ? sizeSelect.value : 'M';
  const color = colorInput ? colorInput.value : 'Negro';

  // Calculate discount (10% OFF if paying via Transfer / Cash)
  const isTransfer = paymentMethod.includes('Transferencia') || paymentMethod.includes('Efectivo');
  const finalPrice = isTransfer ? Math.round(price * 0.90) : price;

  if (summaryTitle) summaryTitle.textContent = title;
  if (summarySize) summarySize.textContent = size;
  if (summaryColor) summaryColor.textContent = color;
  if (summaryImg && img) summaryImg.src = img;

  if (summaryOrigPrice) {
    summaryOrigPrice.textContent = `$${formatCurrency(price)}`;
    summaryOrigPrice.style.display = isTransfer ? 'inline' : 'none';
  }

  if (summaryTotalPrice) {
    summaryTotalPrice.textContent = `$${formatCurrency(finalPrice)}`;
  }

  if (summaryDiscountTag) {
    summaryDiscountTag.style.display = isTransfer ? 'block' : 'none';
    summaryDiscountTag.textContent = isTransfer ? '✓ 10% OFF aplicado (Transferencia/Efectivo)' : '';
  }
}

/* ──────────────────────────────────────────────────────────
   8. CHECKOUT FORM & WHATSAPP LOGIC
   ────────────────────────────────────────────────────────── */
function initCheckoutForm() {
  const form    = document.getElementById('checkout-form');
  const success = document.getElementById('form-success');
  const submit  = document.getElementById('checkout-submit');

  const productSelect = document.getElementById('order-product');
  const sizeSelect    = document.getElementById('order-size');
  const colorInput    = document.getElementById('order-color');
  const paymentCards  = document.querySelectorAll('.payment-card');

  // Sync inputs with live summary
  if (productSelect) productSelect.addEventListener('change', updateOrderSummary);
  if (sizeSelect) sizeSelect.addEventListener('change', updateOrderSummary);
  if (colorInput) colorInput.addEventListener('input', updateOrderSummary);

  // Payment method selection cards
  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
      updateOrderSummary();
    });
  });

  // Initial summary load
  updateOrderSummary();

  if (!form) return;

  const clearFormError = () => {
    const existingErr = form.querySelector('.form-error');
    if (existingErr) existingErr.remove();
  };

  const showValidationError = (msg) => {
    clearFormError();
    const errorMsg = document.createElement('div');
    errorMsg.className = 'form-error';
    errorMsg.setAttribute('role', 'alert');
    errorMsg.textContent = msg;

    if (submit) {
      form.insertBefore(errorMsg, submit);
    } else {
      form.appendChild(errorMsg);
    }
  };

  const showSuccessView = (waUrl) => {
    if (typeof gsap !== 'undefined') {
      gsap.to(form, {
        opacity: 0,
        y: -15,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          form.hidden = true;
          form.style.display = 'none';
          if (success) {
            success.hidden = false;
            success.style.display = 'block';
            const link = document.getElementById('success-wa-link');
            if (link) link.href = waUrl;
            gsap.fromTo(success,
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
            );
          }
        }
      });
    } else {
      form.hidden = true;
      form.style.display = 'none';
      if (success) {
        success.hidden = false;
        success.style.display = 'block';
        const link = document.getElementById('success-wa-link');
        if (link) link.href = waUrl;
      }
    }
  };

  const resetFormView = () => {
    form.reset();
    clearFormError();
    form.hidden = false;
    form.style.display = 'flex';
    form.style.opacity = '1';
    if (success) {
      success.hidden = true;
      success.style.display = 'none';
    }
    updateOrderSummary();
  };

  const anotherBtn = document.getElementById('res-another-btn');
  if (anotherBtn) {
    anotherBtn.addEventListener('click', resetFormView);
  }

  // FORM SUBMISSION: Generates formatted WhatsApp order
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormError();

    const nameInput    = document.getElementById('order-name');
    const phoneInput   = document.getElementById('order-phone');
    const addressInput = document.getElementById('order-address');
    const notesInput   = document.getElementById('order-notes');

    const fields = [
      { el: nameInput, label: 'Nombre y Apellido' },
      { el: phoneInput, label: 'Teléfono / WhatsApp' },
      { el: addressInput, label: 'Dirección de entrega' }
    ];

    const missing = [];
    fields.forEach(({ el, label }) => {
      if (!el || !el.value || !el.value.trim()) {
        missing.push(label);
        if (el) shakeField(el);
      }
    });

    if (missing.length > 0) {
      showValidationError(`Por favor completá los campos obligatorios: ${missing.join(', ')}.`);
      return;
    }

    // Gather Order Data
    const customerName = nameInput.value.trim();
    const customerPhone = phoneInput.value.trim();
    const customerAddress = addressInput.value.trim();
    const notes = notesInput ? notesInput.value.trim() : '';

    const productOpt = productSelect.options[productSelect.selectedIndex];
    const productName = productOpt ? productOpt.value : 'Prenda Stefyy Store';
    const originalPrice = productOpt && productOpt.dataset.price ? parseInt(productOpt.dataset.price, 10) : 48900;
    const selectedSize = sizeSelect ? sizeSelect.value : 'M';
    const selectedColor = colorInput ? colorInput.value.trim() : 'Negro';
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'Efectivo / Transferencia (10% OFF)';

    const isTransfer = paymentMethod.includes('Transferencia') || paymentMethod.includes('Efectivo');
    const finalTotal = isTransfer ? Math.round(originalPrice * 0.90) : originalPrice;
    const orderId = 'STEF-' + Math.floor(1000 + Math.random() * 9000);

    // Official Stefyy Store WhatsApp Number (Argentina international format: +54 9 11 2345-6789)
    const whatsappPhone = '5491123456789';

    // Construct Elegantly Formatted WhatsApp Text with Asterisks and Emojis
    const discountText = isTransfer ? `• *Descuento aplicado:* 10% OFF por Transferencia / Efectivo (-$${formatCurrency(originalPrice - finalTotal)})%0A` : '';
    const notesText = notes ? `📝 *Aclaraciones:* ${notes}%0A` : '';

    const message = `✨ *NUEVO PEDIDO — STEFYY STORE* ✨%0A` +
      `━━━━━━━━━━━━━━━━━━━━━%0A` +
      `🛍️ *DETALLE DE LA COMPRA:*%0A` +
      `• *N° de Orden:* ${orderId}%0A` +
      `• *Prenda:* ${productName}%0A` +
      `• *Talle:* ${selectedSize}%0A` +
      `• *Color:* ${selectedColor}%0A` +
      `• *Precio de lista:* $${formatCurrency(originalPrice)}%0A` +
      discountText +
      `💰 *TOTAL A ABONAR:* $${formatCurrency(finalTotal)}%0A` +
      `💳 *Forma de pago elegida:* ${paymentMethod}%0A%0A` +
      `👤 *DATOS PARA EL ENVÍO:*%0A` +
      `• *Clienta:* ${customerName}%0A` +
      `• *WhatsApp:* ${customerPhone}%0A` +
      `• *Dirección y Localidad:* ${customerAddress}%0A` +
      notesText +
      `━━━━━━━━━━━━━━━━━━━━━%0A` +
      `¡Hola Stefyy! Quiero encargar esta prenda. ¿Tienen disponibilidad para coordinar el pago y el envío? 💖`;

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${message}`;

    // Create Order Object for Admin Panel & Persistence
    const newOrder = {
      id: orderId,
      orderId: orderId,
      customerName: customerName,
      phone: customerPhone,
      address: customerAddress,
      productName: productName,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
      quantity: 1,
      originalPrice: originalPrice,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod,
      status: 'Pendiente',
      whatsappStatus: 'Enviado por Clienta',
      notes: notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to LocalStorage under 'stefyy_orders'
    try {
      const existing = JSON.parse(localStorage.getItem('stefyy_orders') || '[]');
      existing.unshift(newOrder);
      localStorage.setItem('stefyy_orders', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // Save to Firestore if connected
    const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);
    if (dbInstance && typeof dbInstance.collection === 'function') {
      dbInstance.collection('orders').doc(orderId).set(newOrder).catch(err => {
        console.warn('Firestore orders sync notice:', err);
      });
    }

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');

    // Show Confirmation Views
    showSuccessView(whatsappUrl);
    openSuccessModal({
      orderId,
      customerName,
      productName,
      variant: `${selectedSize} · ${selectedColor}`,
      paymentMethod,
      total: `$${formatCurrency(finalTotal)}`,
      whatsappUrl
    });

    showToast('¡Redirigiendo a WhatsApp con tu pedido!', 'success');
  });
}

/* ──────────────────────────────────────────────────────────
   9. TESTIMONIALS SLIDER
   ────────────────────────────────────────────────────────── */
function initTestimonials() {
  const track         = document.getElementById('testimonials-track');
  const prevBtn       = document.getElementById('testimonial-prev');
  const nextBtn       = document.getElementById('testimonial-next');
  const dotsContainer = document.getElementById('testimonials-dots');

  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoplayTimer;

  const getVisible = () => window.innerWidth < 768 ? 1 : 2;

  const createDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const visible = getVisible();
    const totalSlides = Math.ceil(total / visible);
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir a opinión ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i * visible));
      dotsContainer.appendChild(dot);
    }
  };

  const updateDots = () => {
    if (!dotsContainer) return;
    const visible = getVisible();
    const dots    = dotsContainer.querySelectorAll('.testimonial-dot');
    const activeIndex = Math.floor(current / visible);
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === activeIndex);
    });
  };

  const goTo = (index) => {
    const visible = getVisible();
    const max = Math.max(0, total - visible);
    current = Math.min(Math.max(0, index), max);

    const cardWidth = cards[0].offsetWidth;
    const gapStr    = getComputedStyle(track).columnGap;
    const gap       = parseFloat(gapStr) || 32;
    const offset    = current * (cardWidth + gap);

    gsap.to(track, {
      x: -offset,
      duration: 0.65,
      ease: 'power3.out'
    });

    updateDots();
  };

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - getVisible()); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + getVisible()); resetAutoplay(); });

  const startAutoplay = () => {
    autoplayTimer = setInterval(() => {
      const visible = getVisible();
      const max = Math.max(0, total - visible);
      if (current + visible > max) {
        goTo(0);
      } else {
        goTo(current + visible);
      }
    }, 5500);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayTimer);
    startAutoplay();
  };

  // Touch Swipe
  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goTo(current + getVisible());
      else goTo(current - getVisible());
    }
    resetAutoplay();
  });

  createDots();
  startAutoplay();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      createDots();
      goTo(0);
    }, 150);
  });
}

/* ──────────────────────────────────────────────────────────
   10. MODAL & TOAST NOTIFICATIONS
   ────────────────────────────────────────────────────────── */
function openSuccessModal(order) {
  const modal = document.getElementById('reservation-success-modal');
  if (!modal) return;

  const idEl      = document.getElementById('modal-order-id');
  const nameEl    = document.getElementById('modal-order-name');
  const prodEl    = document.getElementById('modal-order-product');
  const varEl     = document.getElementById('modal-order-variant');
  const payEl     = document.getElementById('modal-order-payment');
  const totalEl   = document.getElementById('modal-order-total');
  const waBtn     = document.getElementById('modal-wa-btn');

  if (idEl) idEl.textContent = order.orderId;
  if (nameEl) nameEl.textContent = order.customerName;
  if (prodEl) prodEl.textContent = order.productName;
  if (varEl) varEl.textContent = order.variant;
  if (payEl) payEl.textContent = order.paymentMethod;
  if (totalEl) totalEl.textContent = order.total;
  if (waBtn) waBtn.href = order.whatsappUrl;

  modal.hidden = false;
  modal.style.display = 'flex';
  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');

  const closeIcon = document.getElementById('res-modal-close-icon');
  const homeBtn   = document.getElementById('res-modal-home-btn');

  const closeModal = () => {
    modal.hidden = true;
    modal.style.display = 'none';
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (closeIcon) closeIcon.onclick = closeModal;
  if (homeBtn) {
    homeBtn.onclick = () => {
      closeModal();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  // Click outside card to close
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Close on Escape key
  const onKeyEsc = (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
      document.removeEventListener('keydown', onKeyEsc);
    }
  };
  document.addEventListener('keydown', onKeyEsc);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

function shakeField(field) {
  field.style.borderColor = '#B84A39';
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(field,
      { x: 0 },
      { x: 7, duration: 0.07, ease: 'power2.inOut', yoyo: true, repeat: 5 }
    );
  }
  const clear = () => { field.style.borderColor = ''; };
  field.addEventListener('input', clear, { once: true });
  field.addEventListener('change', clear, { once: true });
}

function formatCurrency(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
