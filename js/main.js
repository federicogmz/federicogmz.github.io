// Smooth scroll for navigation links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        window.scrollTo({
            top: target.offsetTop - 60,
            behavior: 'smooth'
        });
    });
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section');
window.addEventListener('scroll', () => {
    let scrollPos = window.scrollY + 100;
    sections.forEach(sec => {
        if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
            const id = sec.getAttribute('id');
            navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
        }
    });
});

// Fetch GitHub repos
fetch('https://api.github.com/users/federicogmz/repos?sort=updated')
    .then(res => res.json())
    .then(repos => {
        const container = document.getElementById('repo-list');
        container.innerHTML = '';
        repos.forEach(repo => {
            const div = document.createElement('div');
            div.className = 'repo-card';
            div.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
        <p>${repo.description || ''}</p>
      `;
            container.appendChild(div);
        });
    })
    .catch(() => document.getElementById('repo-list').innerText = 'Failed to load repos.');

// Fetch publications from local JSON
fetch('data/gscholar.json')
    .then(res => res.json())
    .then(pubs => {
        const list = document.getElementById('publications-list');
        list.innerHTML = '';
        pubs.forEach(pub => {
            const { title, link, authors = [], date = [], journal = '', citations = 0 } = pub;
            const pubDate = date.length ? date.join('-') : '';
            const authorNames = authors.slice(0, 3).join(', ') + (authors.length > 3 ? ', et al.' : '');
            const div = document.createElement('div');
            div.className = 'publication-card';
            div.innerHTML = `
        <h3><a href="${link}" target="_blank">${title}</a></h3>
        <p><strong>Authors:</strong> ${authorNames}</p>
        <p><strong>Venue:</strong> ${journal || 'N/A'}</p>
        <p><strong>Date:</strong> ${pubDate}</p>
        <p><strong>Citations:</strong> ${citations}</p>
      `;
            list.appendChild(div);
        });
    })
    .catch(() => document.getElementById('publications-list').innerText = 'Failed to load publications.');

// Render LinkedIn profile data into hero, about, education, skills, work
fetch('data/linkedin.json')
    .then(res => res.json())
    .then(data => {
        const p = data[0];
        // Profile photo in hero
        const photo = document.getElementById('hero-photo');
        photo.src = p.profile_photo;
        photo.alt = p.name;
        // Hero header
        document.getElementById('hero-name').textContent = p.name;
        document.getElementById('hero-headline').textContent = p.headline;
        // Use LinkedIn banner photo for hero background
        const heroSection = document.getElementById('hero');
        heroSection.style.backgroundImage = `url(${p.banner_photo})`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
        // About bio (static content preserved)
        // Only set dynamic bio if non-empty, else keep static HTML
        if (p.bio) {
            document.getElementById('about-bio').innerHTML = `<p>${p.bio}</p>`;
        }
        // Education items as cards
        const eduDiv = document.getElementById('education-list');
        p.schools.forEach(s => {
            const card = document.createElement('div');
            card.className = 'card';
            const start = new Date(s.start_date).getFullYear();
            const end = s.end_date ? new Date(s.end_date).getFullYear() : 'Present';
            card.innerHTML = `
                <h3>${s.degree}</h3>
                <p><strong>${s.school}</strong> <span>(${start}–${end})</span></p>
            `;
            eduDiv.appendChild(card);
        });
        // Skills badges - use top skills
        const skillsDiv = document.getElementById('skills-list');
        [p.top_skill_1, p.top_skill_2, p.top_skill_3]
            .filter(Boolean)
            .forEach(skillName => {
                const badge = document.createElement('span');
                badge.className = 'skill-badge';
                badge.textContent = skillName;
                skillsDiv.appendChild(badge);
            });
        // Work experiences
        const workDiv = document.getElementById('work-list');
        p.experiences.forEach(e => {
            const card = document.createElement('div');
            card.className = 'card';
            const startY = new Date(e.start_date).getFullYear();
            const endY = e.end_date ? new Date(e.end_date).getFullYear() : 'Present';
            card.innerHTML = `
        <h3>${e.title}</h3>
        <p><strong>${e.company}</strong> <span>(${startY}–${endY})</span></p>
        <p>${e.location}</p>
      `;
            workDiv.appendChild(card);
        });
        // Contact links dynamic
        const contactDiv = document.getElementById('contact-links');
        contactDiv.innerHTML = `
          <a href="mailto:${p.connection_email}"><i class="fas fa-envelope"></i> ${p.connection_email}</a>
          <a href="https://github.com/${p.profile_id}" target="_blank"><i class="fab fa-github"></i> GitHub</a>
          <a href="${p.profile_link}" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>
          <a href="https://scholar.google.com/citations?user=O0ef_-YAAAAJ&hl=en" target="_blank"><i class="fas fa-graduation-cap"></i> Google Scholar</a>
          <a href="https://orcid.org/0000-0002-8525-4354" target="_blank"><i class="fab fa-orcid"></i> ORCID</a>
        `;
    })
    .catch(err => console.error('Failed to load LinkedIn profile:', err));
