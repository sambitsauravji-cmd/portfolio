// ================================================================
// PORTFOLIO SCRIPT — Sambit Sourav
// This file does ONE job: read data.json, build the page.
// ================================================================

// ----------------------------------------------------------------
// ENTRY POINT
// fetch() is a built-in browser function that reads a file/URL.
// It returns a "Promise" — meaning "I'll give you the data soon,
// not right now." The .then() chain runs when the data arrives.
// async/await is just cleaner syntax for the same thing.
// ----------------------------------------------------------------
async function loadPortfolio() {
  try {
    const response = await fetch("data.json");   // ask browser to read the file
    const data = await response.json();          // parse it from text → JS object

    // Now 'data' is a plain JS object — same shape as your data.json.
    // We pass it to each builder function below.
    buildHero(data);
    buildAbout(data.about);
    buildSkills(data.skills);
    buildProjects(data.projects);
    buildContact(data.contact);
    buildFooter(data.footer);

    // Start animations after content is in the DOM
    startTypewriter(data.role);
    startScrollAnimations();

  } catch (error) {
    // If data.json can't be read, we'll know exactly why
    console.error("Failed to load portfolio data:", error);
  }
}


// ----------------------------------------------------------------
// HERO SECTION
// Fills the name and bio. The role/title is handled by the
// typewriter function separately (it needs to loop and animate).
// ----------------------------------------------------------------
function buildHero(data) {
  document.getElementById("hero-name").textContent = data.name;
  document.getElementById("hero-bio").textContent = data.bio;
}


// ----------------------------------------------------------------
// TYPEWRITER EFFECT
// Takes an array of roles like ["Developer", "Engineer", ...]
// and types them out one character at a time, then deletes them.
//
// How it works:
// - roleIndex tracks which role we're on
// - charIndex tracks how many characters are visible
// - isDeleting flips between typing and erasing
// - setTimeout calls itself recursively to create the loop
// ----------------------------------------------------------------
function startTypewriter(roles) {
  const el = document.getElementById("typewriter");
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      // Erase one character
      el.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      // Add one character
      el.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    // Decide what to do next
    let delay = isDeleting ? 60 : 110; // erase faster than type

    if (!isDeleting && charIndex === currentRole.length) {
      // Finished typing — pause, then start deleting
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting — move to next role
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length; // loop back to 0 at end
    }

    setTimeout(type, delay);
  }

  type(); // kick it off
}


// ----------------------------------------------------------------
// ABOUT SECTION
// Fills the description paragraph and builds the stat chips.
//
// innerHTML vs textContent:
// - textContent = plain text only (safe, no HTML)
// - innerHTML = can contain HTML tags (use carefully)
// ----------------------------------------------------------------
function buildAbout(about) {
  document.getElementById("about-description").textContent = about.description;

  // Inject photo if "image" exists in data.json
  if (about.image) {
    const aboutCard = document.querySelector(".about-card");

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "about-image-wrapper";

    const img = document.createElement("img");
    img.src = about.image;                 // reads "assets/images/profile.jpg"
    img.alt = "Sambit Sourav";
    img.className = "about-image";

    imgWrapper.appendChild(img);
    aboutCard.insertBefore(imgWrapper, aboutCard.firstChild); // puts photo before text
  }

  const statsContainer = document.getElementById("about-stats");

  about.stats.forEach(stat => {
    const chip = document.createElement("div");
    chip.className = "stat-chip";
    chip.innerHTML = `
      <span class="stat-value">${stat.value}</span>
      <span class="stat-label">${stat.label}</span>
    `;
    statsContainer.appendChild(chip);
  });
}


// ----------------------------------------------------------------
// SKILLS SECTION
// Loops through each category (Languages, Frameworks, Tools)
// and builds a group with a label + pill badges inside it.
//
// Template literals (the backtick strings) let you embed
// variables directly inside HTML strings using ${variable}.
// ----------------------------------------------------------------
function buildSkills(skills) {
  const container = document.getElementById("skills-container");

  skills.forEach(group => {
    const groupEl = document.createElement("div");
    groupEl.className = "skill-group";

    // Build the pill badges by mapping each skill item to an HTML string
    // .map() transforms an array → another array
    // .join("") stitches those strings together with no separator
    const pills = group.items
      .map(skill => `<span class="skill-pill">${skill}</span>`)
      .join("");

    groupEl.innerHTML = `
      <h3 class="skill-category">${group.category}</h3>
      <div class="skill-pills">${pills}</div>
    `;

    container.appendChild(groupEl);
  });
}


// ----------------------------------------------------------------
// PROJECTS SECTION
// Builds a glass card for each project with title, description,
// tech tags, and GitHub/Live links.
// ----------------------------------------------------------------
function buildProjects(projects) {
  const grid = document.getElementById("projects-grid");

  projects.forEach(project => {
    const card = document.createElement("div");
    card.className = "project-card glass-card";

    const tags = project.tags
      .map(tag => `<span class="project-tag">${tag}</span>`)
      .join("");

    card.innerHTML = `
      <div class="project-top">
        <span class="project-icon">⬡</span>
      </div>
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.description}</p>
      <div class="project-tags">${tags}</div>
      <div class="project-links">
        <a href="${project.github}" target="_blank" class="project-link">
          GitHub ↗
        </a>
        <a href="${project.live}" target="_blank" class="project-link project-link-live">
          Live ↗
        </a>
      </div>
    `;

    grid.appendChild(card);
  });
}


// ----------------------------------------------------------------
// CONTACT SECTION
// Fills the intro text, email link, and social icon buttons.
// ----------------------------------------------------------------
function buildContact(contact) {
  document.getElementById("contact-intro").textContent = contact.intro;

  const emailEl = document.getElementById("contact-email");
  emailEl.textContent = contact.email;
  emailEl.href = `mailto:${contact.email}`; // clicking opens mail app

  const linksContainer = document.getElementById("contact-links");

  contact.socials.forEach(social => {
    const link = document.createElement("a");
    link.href = social.url;
    link.target = "_blank";          // open in new tab
    link.className = "social-btn";
    link.innerHTML = `
      <span class="social-icon">${social.icon}</span>
      <span>${social.label}</span>
    `;
    linksContainer.appendChild(link);
  });
}


// ----------------------------------------------------------------
// FOOTER
// ----------------------------------------------------------------
function buildFooter(text) {
  document.getElementById("footer-text").textContent = `© ${new Date().getFullYear()} — ${text}`;
}


// ----------------------------------------------------------------
// SCROLL ANIMATIONS
// Uses IntersectionObserver — a browser API that watches elements
// and fires a callback when they enter or leave the viewport.
//
// This is more performant than the old scroll event listener
// approach. No math, no manual scroll position tracking.
//
// How it works:
// - We mark every section with class "reveal"
// - Observer watches all of them
// - When one enters the viewport → add class "visible"
// - CSS handles the actual animation (opacity + translateY)
// ----------------------------------------------------------------
function startScrollAnimations() {
  // Select all elements we want to animate on scroll
  const revealEls = document.querySelectorAll(
    ".glass-card, .skill-group, .project-card, .section-header"
  );

  // Add the base reveal class to each
  revealEls.forEach(el => el.classList.add("reveal"));

  // Create the observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Element entered viewport — make it visible
          entry.target.classList.add("visible");
          // Stop watching it once it's shown (no need to re-animate)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12, // trigger when 12% of element is visible
    }
  );

  revealEls.forEach(el => observer.observe(el));
}


// ----------------------------------------------------------------
// NAVBAR — shrink on scroll
// Adds a "scrolled" class to navbar when user scrolls down.
// CSS then makes the navbar smaller and more opaque.
// ----------------------------------------------------------------
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});


// ----------------------------------------------------------------
// KICK EVERYTHING OFF
// This runs when the script is first loaded by the browser.
// ----------------------------------------------------------------
loadPortfolio();