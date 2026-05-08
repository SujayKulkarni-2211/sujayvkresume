/* shared.js — navbar, footer injection, scroll behaviour, hamburger */
(function () {
  'use strict';

  /* ── Determine current page ── */
  const path = window.location.pathname.split('/').pop() || 'index.html';

  /* ── Navbar HTML ── */
  const navHTML = `
<nav class="navbar" id="site-navbar">
  <div class="nav-inner">
    <a href="index.html" class="nav-brand">S<span>V</span>K</a>
    <ul class="nav-links" id="nav-links">
      <li><a href="index.html"          data-page="index.html">Entrance</a></li>
      <li><a href="swroom.html"         data-page="swroom.html">Study / Work Room</a></li>
      <li><a href="persaudi.html"       data-page="persaudi.html">Personal Auditorium</a></li>
      <li><a href="balcony.html"        data-page="balcony.html">Balcony</a></li>
      <li><a href="svkachievements.html" data-page="svkachievements.html">Achievements</a></li>
      <li><a href="contact.html"        data-page="contact.html">Knock Knock</a></li>
    </ul>
    <a href="SujayResume.pdf" target="_blank" class="nav-resume-btn">Resume ↗</a>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>`;

  /* ── Footer HTML ── */
  const footerHTML = `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="footer-brand-name">S<span>V</span>K</div>
      <p class="footer-tagline">idea → implementation → deployment → impact</p>
      <div class="footer-social">
        <a href="https://github.com/SujayKulkarni-2211" target="_blank" class="footer-social-link" title="GitHub">
          <i class="fab fa-github"></i>
        </a>
        <a href="https://www.linkedin.com/in/sujay-kulkarni-51391b286/" target="_blank" class="footer-social-link" title="LinkedIn">
          <i class="fab fa-linkedin-in"></i>
        </a>
        <a href="https://huggingface.co/sujayvk-btech23" target="_blank" class="footer-social-link" title="HuggingFace">🤗</a>
        <a href="https://www.instagram.com/sujaykulkarni2211/" target="_blank" class="footer-social-link" title="Instagram">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="https://bit.ly/sujayvitae" target="_blank" class="footer-social-link" title="bit.ly/sujayvitae">🔗</a>
      </div>
    </div>
    <div class="footer-links-grid">
      <div class="footer-col">
        <p class="footer-col-title">Rooms</p>
        <div class="footer-col-links">
          <a href="index.html">Entrance</a>
          <a href="swroom.html">Study / Work Room</a>
          <a href="persaudi.html">Personal Auditorium</a>
          <a href="balcony.html">Balcony</a>
          <a href="svkachievements.html">Wall of Achievements</a>
          <a href="contact.html">Knock Knock</a>
        </div>
      </div>
      <div class="footer-col">
        <p class="footer-col-title">Profiles</p>
        <div class="footer-col-links">
          <a href="https://github.com/SujayKulkarni-2211" target="_blank">GitHub</a>
          <a href="https://huggingface.co/sujayvk-btech23" target="_blank">HuggingFace</a>
          <a href="https://www.linkedin.com/in/sujay-kulkarni-51391b286/" target="_blank">LinkedIn</a>
          <a href="https://bit.ly/sujayvitae" target="_blank">bit.ly/sujayvitae</a>
        </div>
      </div>
      <div class="footer-col">
        <p class="footer-col-title">Resources</p>
        <div class="footer-col-links">
          <a href="SujayResume.pdf" target="_blank">Resume PDF</a>
          <a href="mailto:sujayvkulkarni@gmail.com">Email</a>
          <a href="tel:+919380142763">+91-9380142763</a>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2024 Sujay V Kulkarni — RV University, Bengaluru</p>
    <p>Handcrafted. No frameworks. Just craft.</p>
  </div>
</footer>`;

  /* ── Inject on DOM ready ── */
  function inject() {
    const navPlaceholder    = document.getElementById('nav-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (navPlaceholder) {
      navPlaceholder.outerHTML = navHTML;
      initNavbar();
    }
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = footerHTML;
    }
  }

  /* ── Navbar behaviour ── */
  function initNavbar() {
    const navbar    = document.getElementById('site-navbar');
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks  = document.getElementById('nav-links');
    if (!navbar) return;

    /* Active link */
    navLinks.querySelectorAll('a[data-page]').forEach(link => {
      if (link.getAttribute('data-page') === path) {
        link.classList.add('active');
      }
    });

    /* Scroll: add glassmorphism */
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Hamburger */
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });

    /* Close mobile menu on link click */
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    /* Close on outside click */
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Scroll reveal ── */
  function initReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  /* ── Timeline filters (swroom.html) ── */
  function initTimelineFilters() {
    const btns  = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.timeline-item');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        items.forEach(item => {
          if (filter === 'all') {
            item.classList.remove('hidden');
          } else {
            const cats = item.dataset.categories || '';
            item.classList.toggle('hidden', !cats.includes(filter));
          }
        });
      });
    });
  }

  /* ── Custom carousel (svkachievements) ── */
  function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots   = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    if (!slides.length) return;

    let current = 0;

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
    }

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    /* Auto-advance */
    setInterval(() => goTo(current + 1), 4500);
  }

  /* ── Contact form (contact.html) ── */
  function initContactForm() {
    const btn = document.getElementById('contact-submit');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const name    = document.getElementById('fullName')?.value?.trim();
      const email   = document.getElementById('email')?.value?.trim();
      const message = document.getElementById('message')?.value?.trim();

      if (!name || name.length < 2) {
        alert('Please enter your full name.');
        return;
      }
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      if (!message) {
        alert('Please enter a message.');
        return;
      }

      if (typeof emailjs !== 'undefined') {
        btn.textContent = 'Sending…';
        btn.disabled = true;
        emailjs.send('service_3pnt78c', 'template_1xthj2s', {
          to_name: 'Sujay Kulkarni',
          from_name: name,
          email,
          message,
        }).then(() => {
          alert(`Thank you ${name}! I'll get back to you at ${email}.`);
          document.getElementById('contact-form')?.reset();
        }).catch(() => {
          alert('Could not send — please email me directly at sujayvkulkarni@gmail.com');
        }).finally(() => {
          btn.textContent = 'Send Message';
          btn.disabled = false;
        });
      } else {
        alert(`Message received from ${name}. (EmailJS not loaded — please email sujayvkulkarni@gmail.com directly.)`);
      }
    });
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { inject(); initReveal(); initTimelineFilters(); initCarousel(); initContactForm(); });
  } else {
    inject(); initReveal(); initTimelineFilters(); initCarousel(); initContactForm();
  }
})();
