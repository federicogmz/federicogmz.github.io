/* ============================================================
   main.js — Federico Gómez Portfolio
   ============================================================ */

// ── Nav scroll effect ────────────────────────────────────────
const nav = document.getElementById('site-nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Mobile nav toggle ────────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.querySelector('.nav-links');
navToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

// ── Smooth scroll for nav links ──────────────────────────────
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navLinks.classList.remove('open');
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (target) window.scrollTo({ top: target.offsetTop - 64, behavior: 'smooth' });
    });
});

// ── Active nav highlight on scroll ──────────────────────────
const allNavLinks = document.querySelectorAll('.nav-link');
const allSections = document.querySelectorAll('section, footer');

window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 100;
    allSections.forEach(sec => {
        if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
            const id = sec.id;
            allNavLinks.forEach(link =>
                link.classList.toggle('active', link.getAttribute('href') === '#' + id)
            );
        }
    });
}, { passive: true });

// ── Scroll reveal (Intersection Observer) ───────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Trigger child stagger if expertise-grid
            if (entry.target.classList.contains('expertise-grid')) {
                entry.target.classList.add('visible-parent');
                entry.target.querySelectorAll('.reveal-child').forEach(child =>
                    child.classList.add('visible')
                );
            }

            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .expertise-grid').forEach(el => revealObserver.observe(el));

// ── Language dot color map ───────────────────────────────────
const langColors = {
    'Python':           '#3572A5',
    'R':                '#198CE7',
    'JavaScript':       '#f1e05a',
    'Jupyter Notebook': '#DA5B0B',
    'HTML':             '#e34c26',
    'CSS':              '#563d7c',
    'Astro':            '#ff5a03',
    'AGS Script':       '#aaaaaa',
};

// ── Fetch GitHub repos ───────────────────────────────────────
fetch('https://api.github.com/users/federicogmz/repos?sort=updated&per_page=12')
    .then(res => res.json())
    .then(repos => {
        const container = document.getElementById('repo-list');
        container.innerHTML = '';

        // Filter out profile and .github.io repos and the federicogmz profile repo
        const filtered = repos
            .filter(r => !r.fork && r.name !== 'federicogmz' && r.name !== 'federicogmz.github.io')
            .slice(0, 9);

        filtered.forEach(repo => {
            const langColor = langColors[repo.language] || '#666';
            const div = document.createElement('div');
            div.className = 'repo-card';
            div.innerHTML = `
                <h3>
                    <i class="fas fa-book-open"></i>
                    <a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a>
                </h3>
                <p class="repo-desc">${repo.description || '<em style="opacity:0.5">No description</em>'}</p>
                <div class="repo-meta">
                    ${repo.language ? `<span><span class="lang-dot" style="background:${langColor}"></span>${repo.language}</span>` : ''}
                    ${repo.stargazers_count > 0 ? `<span><i class="fas fa-star"></i>${repo.stargazers_count}</span>` : ''}
                    ${repo.forks_count > 0 ? `<span><i class="fas fa-code-branch"></i>${repo.forks_count}</span>` : ''}
                </div>
            `;
            container.appendChild(div);
        });
    })
    .catch(() => {
        document.getElementById('repo-list').innerHTML =
            '<p style="color:var(--text-muted)">Could not load repositories.</p>';
    });

// ── Fetch publications from local JSON ───────────────────────
fetch('data/gscholar.json')
    .then(res => res.json())
    .then(pubs => {
        const list = document.getElementById('publications-list');
        list.innerHTML = '';
        pubs.forEach(pub => {
            const { title, link, authors = [], date = [], journal = '', citations = 0 } = pub;
            const pubDate     = date.length ? date.join('-') : '';
            const authorNames = authors.slice(0, 3).join(', ') + (authors.length > 3 ? ', et al.' : '');
            const div = document.createElement('div');
            div.className = 'publication-card';
            div.innerHTML = `
                <h3><a href="${link}" target="_blank" rel="noopener">${title}</a></h3>
                <p><strong>Authors:</strong> ${authorNames}</p>
                <p><strong>Venue:</strong> ${journal || 'N/A'}</p>
                <div class="pub-badges">
                    ${pubDate ? `<span class="pub-badge"><i class="fas fa-calendar-alt"></i> ${pubDate}</span>` : ''}
                    ${citations > 0 ? `<span class="pub-badge"><i class="fas fa-quote-left"></i> ${citations} citations</span>` : ''}
                </div>
            `;
            list.appendChild(div);
        });
    })
    .catch(() => {
        document.getElementById('publications-list').innerHTML =
            '<p style="color:var(--text-muted)">Could not load publications.</p>';
    });

// ── Fetch LinkedIn profile data ───────────────────────────────
fetch('data/linkedin.json')
    .then(res => res.json())
    .then(data => {
        const p = data[0];

        // Hero photo & name
        const photo = document.getElementById('hero-photo');
        if (photo && p.profile_photo) {
            photo.src = p.profile_photo;
            photo.alt = p.name || 'Federico Gómez';
        }

        const heroName = document.getElementById('hero-name');
        if (heroName && p.name) heroName.textContent = p.name;

        // Headline: keep our custom tagline (don't overwrite)
        // document.getElementById('hero-headline').textContent = p.headline;

        // Hero background from LinkedIn banner
        if (p.banner_photo) {
            const hero = document.getElementById('hero');
            const mesh = hero.querySelector('.hero-bg-mesh');
            if (mesh) {
                mesh.style.backgroundImage = `url(${p.banner_photo})`;
                mesh.style.backgroundSize = 'cover';
                mesh.style.backgroundPosition = 'center';
                mesh.style.opacity = '0.08';
            }
        }

        // About bio — preserve static content unless LinkedIn bio is present
        if (p.bio && p.bio.trim()) {
            const bio = document.getElementById('about-bio');
            if (bio) bio.innerHTML = `<p>${p.bio.replace(/\n\n/g, '</p><p>')}</p>`;
        }

        // Education cards
        const eduDiv = document.getElementById('education-list');
        if (eduDiv && p.schools) {
            p.schools.forEach(s => {
                const start = s.start_date ? new Date(s.start_date).getFullYear() : '';
                const end   = s.end_date   ? new Date(s.end_date).getFullYear()   : 'Present';
                const card  = document.createElement('div');
                card.className = 'card reveal';
                card.innerHTML = `
                    <h3>${s.degree || s.field_of_study || 'Degree'}</h3>
                    <p><strong>${s.school}</strong><span>${start}–${end}</span></p>
                `;
                eduDiv.appendChild(card);
                revealObserver.observe(card);
            });
        }

        // Work experience cards
        const workDiv = document.getElementById('work-list');
        if (workDiv && p.experiences) {
            p.experiences.forEach(e => {
                const startY = e.start_date ? new Date(e.start_date).getFullYear() : '';
                const endY   = e.end_date   ? new Date(e.end_date).getFullYear()   : 'Present';
                const card   = document.createElement('div');
                card.className = 'card reveal';
                card.innerHTML = `
                    <h3>${e.title}</h3>
                    <p><strong>${e.company}</strong><span>${startY}–${endY}</span></p>
                    ${e.location ? `<p>${e.location}</p>` : ''}
                `;
                workDiv.appendChild(card);
                revealObserver.observe(card);
            });
        }

        // Skill badges — expand beyond just the top 3 LinkedIn skills
        const skillsDiv = document.getElementById('skills-list');
        if (skillsDiv) {
            const allSkills = [
                p.top_skill_1, p.top_skill_2, p.top_skill_3,
                'Remote Sensing', 'UAS / Photogrammetry', 'Google Earth Engine',
                'SHALSTAB', 'TRIGRS', 'OpenDroneMap', 'InSAR',
                'GeoPandas', 'Rasterio', 'scikit-learn', 'GDAL',
                'QGIS', 'ArcGIS Pro', 'Python', 'R'
            ].filter(Boolean);

            // Deduplicate
            [...new Set(allSkills)].forEach(skill => {
                const badge = document.createElement('span');
                badge.className = 'skill-badge';
                badge.textContent = skill;
                skillsDiv.appendChild(badge);
            });
        }

        // Contact links
        const contactDiv = document.getElementById('contact-links');
        if (contactDiv) {
            contactDiv.innerHTML = `
                <a href="mailto:${p.connection_email || 'fjgomezc@eafit.edu.co'}">
                    <i class="fas fa-envelope"></i> ${p.connection_email || 'fjgomezc@eafit.edu.co'}
                </a>
                <a href="https://github.com/${p.profile_id || 'federicogmz'}" target="_blank" rel="noopener">
                    <i class="fab fa-github"></i> GitHub
                </a>
                <a href="${p.profile_link || 'https://www.linkedin.com/in/federicogmz/'}" target="_blank" rel="noopener">
                    <i class="fab fa-linkedin"></i> LinkedIn
                </a>
                <a href="https://scholar.google.com/citations?user=O0ef_-YAAAAJ&hl=en" target="_blank" rel="noopener">
                    <i class="fas fa-graduation-cap"></i> Google Scholar
                </a>
                <a href="https://orcid.org/0000-0002-8525-4354" target="_blank" rel="noopener">
                    <i class="fab fa-orcid"></i> ORCID
                </a>
            `;
        }
    })
    .catch(err => console.warn('LinkedIn data not loaded:', err));
