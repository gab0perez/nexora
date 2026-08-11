(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const cursorGlow = document.querySelector('.cursor-glow');
  const form = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');
  const year = document.querySelector('#year');

  if (year) year.textContent = new Date().getFullYear();

  // Menú móvil
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
      navMenu.classList.toggle('open', !isOpen);
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú');
        navMenu.classList.remove('open');
      });
    });
  }

  // Luz suave que acompaña al cursor en escritorio.
  if (cursorGlow && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('pointermove', event => {
      targetX = event.clientX;
      targetY = event.clientY;
    }, { passive: true });

    const animateGlow = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
  }

  // Aparición al entrar en viewport.
  const revealItems = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(item => observer.observe(item));
  }

  // Tilt sutil para tarjetas, únicamente en dispositivos con mouse.
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateX = (0.5 - y) * 5;
        const rotateY = (x - 0.5) * 5;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Botones magnéticos: movimiento muy pequeño para conservar elegancia.
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(button => {
      button.addEventListener('pointermove', event => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
      });
      button.addEventListener('pointerleave', () => {
        button.style.transform = '';
      });
    });
  }

  // El formulario prepara y abre una conversación de WhatsApp con los datos del prospecto.
  if (form && formStatus) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const business = String(data.get('business') || '').trim();
      const service = String(data.get('service') || '').trim();
      const message = String(data.get('message') || '').trim();
      if (!name || !business || !service) return;

      const whatsappMessage = [
        'Hola NEXORA, me interesa una propuesta.',
        '',
        `Nombre: ${name}`,
        `Negocio: ${business}`,
        `Servicio: ${service}`,
        message ? `Necesidad: ${message}` : ''
      ].filter(Boolean).join('\n');

      const whatsappUrl = `https://wa.me/528331487993?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      formStatus.textContent = 'Abriendo WhatsApp para continuar tu solicitud…';
    });
  }
})();
