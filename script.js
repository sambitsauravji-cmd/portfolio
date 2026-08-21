// ================================================================
// SCRIPT.JS — Sambit Sourav | Web Developer Portfolio
// Interactive Canvas, Dynamic Loaders, Smooth Animations & UX
// ================================================================

let portfolioData = null;
let activeSkillCategory = "All";

// ----------------------------------------------------------------
// 1. ENTRY POINT & DATA LOADER
// ----------------------------------------------------------------
async function initPortfolio() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    portfolioData = await response.json();

    // Populate all page sections dynamically
    renderHero(portfolioData);
    renderAbout(portfolioData.about);
    renderSkills(portfolioData.skills);
    renderProjects(portfolioData.projects);
    renderContact(portfolioData.contact);
    renderFooter(portfolioData.footer);

    // Initialize interactive modules
    initTypewriter(portfolioData.role);
    initAmbientCanvas();
    initCursorSpotlight();
    initScrollProgressAndNav();
    initLiveClock(portfolioData.about?.timeZone || "Asia/Kolkata");
    initContactForm(portfolioData.contact?.email);
    initCopyButtons(portfolioData.contact?.email);
    initMobileDrawer();

  } catch (error) {
    console.error("Failed to initialize portfolio:", error);
    showToast("Could not load data.json. Check console.", "error");
  }
}

// ----------------------------------------------------------------
// 2. HERO SECTION
// ----------------------------------------------------------------
function renderHero(data) {
  const bioEl = document.getElementById("hero-bio");
  if (bioEl && data.bio) bioEl.textContent = data.bio;
}

function initTypewriter(roles) {
  const typewriterEl = document.getElementById("typewriter");
  if (!typewriterEl || !roles || !roles.length) return;

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function typeStep() {
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      typewriterEl.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typewriterEl.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? 45 : 95;

    if (!isDeleting && charIdx === currentRole.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 400;
    }

    setTimeout(typeStep, delay);
  }

  typeStep();
}

// ----------------------------------------------------------------
// 3. ABOUT SECTION (BENTO GRID)
// ----------------------------------------------------------------
function renderAbout(about) {
  if (!about) return;

  // Description
  const descEl = document.getElementById("about-description");
  if (descEl && about.description) descEl.textContent = about.description;

  // Stats
  const statsContainer = document.getElementById("about-stats");
  if (statsContainer && about.stats) {
    statsContainer.innerHTML = "";
    about.stats.forEach(stat => {
      const item = document.createElement("div");
      item.className = "stat-item";
      
      const numMatch = stat.value.match(/\d+/);
      const targetNum = numMatch ? parseInt(numMatch[0]) : null;
      const suffix = numMatch ? stat.value.replace(numMatch[0], '') : '';

      item.innerHTML = `
        <div class="stat-number" ${targetNum !== null ? `data-target="${targetNum}" data-suffix="${suffix}"` : ''}>
          ${targetNum !== null ? '0' : stat.value}
        </div>
        <div class="stat-label">${stat.label}</div>
      `;
      statsContainer.appendChild(item);
    });

    observeStatsCounter();
  }
}

// Animate numbers counting up on viewport entry
function observeStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-number[data-target]");
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStatCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(num => observer.observe(num));
}

function animateStatCount(el) {
  const target = parseInt(el.getAttribute("data-target"));
  if (isNaN(target)) return;

  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1200;
  const stepTime = 25;
  const steps = duration / stepTime;
  const increment = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = `${target}${suffix}`;
      clearInterval(timer);
    } else {
      el.textContent = `${Math.floor(current)}${suffix}`;
    }
  }, stepTime);
}

// Real-time IST Clock
function initLiveClock(timeZone) {
  const clockEl = document.getElementById("live-ist-time");
  if (!clockEl) return;

  function updateTime() {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        timeZone: timeZone,
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      clockEl.textContent = timeString;
    } catch (e) {
      clockEl.textContent = new Date().toLocaleTimeString();
    }
  }

  updateTime();
  setInterval(updateTime, 1000);
}

// ----------------------------------------------------------------
// 4. SKILLS SECTION WITH FILTER TABS
// ----------------------------------------------------------------
function renderSkills(skillGroups) {
  if (!skillGroups) return;

  // Render Filter Tabs
  const filterContainer = document.getElementById("skills-filter-container");
  if (filterContainer) {
    filterContainer.innerHTML = "";
    
    // Add "All" Tab
    const allBtn = document.createElement("button");
    allBtn.className = `skill-tab-btn ${activeSkillCategory === "All" ? "active" : ""}`;
    allBtn.textContent = "All Skills";
    allBtn.addEventListener("click", () => {
      activeSkillCategory = "All";
      updateActiveSkillTab();
      filterSkillCards(skillGroups);
    });
    filterContainer.appendChild(allBtn);

    // Add Category Tabs
    skillGroups.forEach(group => {
      const btn = document.createElement("button");
      btn.className = `skill-tab-btn ${activeSkillCategory === group.category ? "active" : ""}`;
      btn.textContent = group.category;
      btn.addEventListener("click", () => {
        activeSkillCategory = group.category;
        updateActiveSkillTab();
        filterSkillCards(skillGroups);
      });
      filterContainer.appendChild(btn);
    });
  }

  filterSkillCards(skillGroups);
}

function updateActiveSkillTab() {
  document.querySelectorAll(".skill-tab-btn").forEach(btn => {
    if (btn.textContent === activeSkillCategory || (activeSkillCategory === "All" && btn.textContent === "All Skills")) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function filterSkillCards(skillGroups) {
  const container = document.getElementById("skills-container");
  if (!container) return;

  container.innerHTML = "";

  const itemsToRender = [];
  skillGroups.forEach(group => {
    if (activeSkillCategory === "All" || activeSkillCategory === group.category) {
      group.items.forEach(item => {
        itemsToRender.push({
          name: typeof item === "string" ? item : item.name,
          category: group.category
        });
      });
    }
  });

  itemsToRender.forEach(skill => {
    const card = document.createElement("div");
    card.className = "skill-card glass-card";

    card.innerHTML = `
      <div class="skill-card-left">
        <span class="skill-bullet-icon">▹</span>
        <div class="skill-info">
          <span class="skill-name">${skill.name}</span>
          <span class="skill-category-label">${skill.category}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ----------------------------------------------------------------
// 5. PROJECTS SECTION
// ----------------------------------------------------------------
function renderProjects(projects) {
  const grid = document.getElementById("projects-grid");
  if (!grid || !projects) return;

  grid.innerHTML = "";

  projects.forEach(project => {
    const card = document.createElement("div");
    card.className = "project-card glass-card";

    // Tags
    const tagsHtml = (project.tags || [])
      .map(tag => `<span class="project-tag">${tag}</span>`)
      .join("");

    card.innerHTML = `
      <div>
        <div class="project-card-top">
          <span class="project-badge-pill">Project</span>
          <span class="project-icon">⬡</span>
        </div>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
      </div>
      <div>
        <div class="project-tags">${tagsHtml}</div>
        <div class="project-actions">
          <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-btn">
            <span>GitHub</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
          ${project.live && project.live !== "#" ? `
          <a href="${project.live}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-primary">
            <span>Live Demo</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </a>
          ` : ''}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ----------------------------------------------------------------
// 6. CONTACT SECTION & INTERACTIVE FORM
// ----------------------------------------------------------------
function renderContact(contact) {
  if (!contact) return;

  const introEl = document.getElementById("contact-intro");
  if (introEl && contact.intro) introEl.textContent = contact.intro;

  const emailEl = document.getElementById("contact-email");
  if (emailEl && contact.email) {
    emailEl.textContent = contact.email;
    emailEl.href = `mailto:${contact.email}`;
  }

  // Social Links
  const linksContainer = document.getElementById("contact-links");
  if (linksContainer && contact.socials) {
    linksContainer.innerHTML = "";
    contact.socials.forEach(social => {
      const a = document.createElement("a");
      a.href = social.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "social-btn";
      const label = social.label || social.name || "Link";
      a.title = label;

      let iconSvg = "";
      const iconKey = (social.icon || label).toLowerCase();
      if (iconKey.includes("gh") || iconKey.includes("github")) {
        iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`;
      } else if (iconKey.includes("li") || iconKey.includes("linkedin")) {
        iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
      } else if (iconKey.includes("x") || iconKey.includes("twitter")) {
        iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`;
      } else {
        iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`;
      }

      a.innerHTML = `${iconSvg} <span>${label}</span>`;
      linksContainer.appendChild(a);
    });
  }
}

function initContactForm(receiverEmail) {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("form-submit-btn");
  const feedback = document.getElementById("form-feedback");
  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.getElementById("name-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("message-error").textContent = "";
    feedback.textContent = "";
    feedback.className = "form-feedback";

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim() || "Project Inquiry";
    const message = form.message.value.trim();

    let isValid = true;

    if (!name || name.length < 2) {
      document.getElementById("name-error").textContent = "Please enter your name.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      document.getElementById("email-error").textContent = "Please enter a valid email address.";
      isValid = false;
    }

    if (!message || message.length < 5) {
      document.getElementById("message-error").textContent = "Please write a message.";
      isValid = false;
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    setTimeout(() => {
      const mailtoUrl = `mailto:${receiverEmail || "sambitsauravji@gmail.com"}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Sambit,\n\nFrom: ${name} (${email})\n\n${message}`)}`;
      
      feedback.textContent = "Message prepared! Opening email client...";
      feedback.className = "form-feedback success";
      showToast("Message prepared! Opening email client...", "success");

      window.location.href = mailtoUrl;

      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Send Message</span>
        <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      `;
    }, 600);
  });
}

function initCopyButtons(email) {
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("Email copied to clipboard!", "success");
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    showToast("Email copied to clipboard!", "success");
  }

  const copyHeroBtn = document.getElementById("copy-email-hero");
  if (copyHeroBtn) {
    copyHeroBtn.addEventListener("click", () => copyText(email || "sambitsauravji@gmail.com"));
  }

  const copyContactBtn = document.getElementById("copy-email-btn");
  if (copyContactBtn) {
    copyContactBtn.addEventListener("click", () => copyText(email || "sambitsauravji@gmail.com"));
  }
}

// ----------------------------------------------------------------
// 7. FOOTER
// ----------------------------------------------------------------
function renderFooter(text) {
  const footerText = document.getElementById("footer-text");
  if (footerText) {
    footerText.textContent = `© ${new Date().getFullYear()} — ${text || "Designed & Built by Sambit Sourav"}`;
  }
}

// ----------------------------------------------------------------
// 8. AMBIENT BACKGROUND CANVAS
// ----------------------------------------------------------------
function initAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = Math.min(Math.floor(window.innerWidth / 25), 35);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.15,
      color: Math.random() > 0.5 ? "rgba(232, 213, 163, " : "rgba(34, 197, 94, "
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ")";
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// ----------------------------------------------------------------
// 9. CURSOR SPOTLIGHT
// ----------------------------------------------------------------
function initCursorSpotlight() {
  const spotlight = document.getElementById("cursor-spotlight");
  if (!spotlight) return;

  window.addEventListener("mousemove", (e) => {
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
  });
}

// ----------------------------------------------------------------
// 10. SCROLL PROGRESS, STICKY NAV & SCROLL SPY
// ----------------------------------------------------------------
function initScrollProgressAndNav() {
  const progressBar = document.getElementById("scroll-progress");
  const header = document.getElementById("header");
  const backToTop = document.getElementById("back-to-top");
  const circle = document.getElementById("progress-ring-circle");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  const circumference = 2 * Math.PI * 20;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = `${progress}%`;

    if (header) {
      if (scrollTop > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    if (backToTop && circle) {
      if (scrollTop > 300) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }

      const offset = circumference - (progress / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }

    let currentSection = "";
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (scrollTop >= top && scrollTop < top + height) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

// ----------------------------------------------------------------
// 11. MOBILE DRAWER MENU
// ----------------------------------------------------------------
function initMobileDrawer() {
  const toggleBtn = document.getElementById("mobile-toggle");
  const drawer = document.getElementById("mobile-drawer");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  if (!toggleBtn || !drawer) return;

  function toggleMenu() {
    const isOpen = drawer.classList.contains("open");
    if (isOpen) {
      drawer.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    } else {
      drawer.classList.add("open");
      toggleBtn.setAttribute("aria-expanded", "true");
    }
  }

  toggleBtn.addEventListener("click", toggleMenu);

  mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
      drawer.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// ----------------------------------------------------------------
// 12. TOAST NOTIFICATION SYSTEM
// ----------------------------------------------------------------
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(15px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 3000);
}

// ----------------------------------------------------------------
// 13. INITIALIZE
// ----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", initPortfolio);