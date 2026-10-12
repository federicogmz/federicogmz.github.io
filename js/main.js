/**
 * Federico Gómez Cardona — Portfolio Interaction Scripts
 * High-performance, vanilla JavaScript without external dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // 1. Navigation Scroll Effect & Mobile Menu Toggle
    // -------------------------------------------------------------
    const siteNav = document.getElementById('site-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            siteNav.classList.add('scrolled');
        } else {
            siteNav.classList.remove('scrolled');
        }
    }, { passive: true });

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Close mobile nav when clicking a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // -------------------------------------------------------------
    // 2. Active Section Spy
    // -------------------------------------------------------------
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    const navLinkElements = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 120;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinkElements.forEach(link => {
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, { passive: true });

    // -------------------------------------------------------------
    // 3. Snippet Copy to Clipboard (with safe fallback)
    // -------------------------------------------------------------
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const textToCopy = button.getAttribute('data-copy') || '';
            if (!textToCopy) return;

            const originalIcon = button.innerHTML;

            const setSuccess = () => {
                button.innerHTML = '<i class="fas fa-check" style="color:#34d399"></i>';
                setTimeout(() => {
                    button.innerHTML = originalIcon;
                }, 2000);
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy)
                    .then(setSuccess)
                    .catch(() => fallbackCopy(textToCopy, setSuccess));
            } else {
                fallbackCopy(textToCopy, setSuccess);
            }
        });
    });

    function fallbackCopy(text, callback) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            if (callback) callback();
        } catch (err) {
            console.warn('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
    }

    // -------------------------------------------------------------
    // 4. Dynamic Publications Loader (from data/gscholar.json)
    // Safe DOM injection without innerHTML XSS vulnerabilities
    // -------------------------------------------------------------
    const pubContainer = document.getElementById('publications-container');
    const pubSearch = document.getElementById('pub-search');
    let loadedPublications = [];
    let loadFailed = false;

    function renderFallback() {
        if (!pubContainer) return;
        pubContainer.innerHTML = '';
        loadFailed = true;

        if (pubSearch) {
            pubSearch.disabled = true;
            pubSearch.placeholder = 'Search disabled (browse directly on Google Scholar)';
        }

        const fallback = document.createElement('div');
        fallback.className = 'fallback-card';

        const p = document.createElement('p');
        p.textContent = 'Explore all peer-reviewed research papers and citations on Google Scholar:';

        const a = document.createElement('a');
        a.href = 'https://scholar.google.com/citations?user=O0ef_-YAAAAJ&hl=en';
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'btn btn-primary';
        a.style.marginTop = '1rem';
        a.innerHTML = '<i class="fas fa-graduation-cap"></i> View Federico Gómez on Google Scholar';

        fallback.appendChild(p);
        fallback.appendChild(a);
        pubContainer.appendChild(fallback);
    }

    function createPublicationCard(pub) {
        const card = document.createElement('article');
        card.className = 'pub-card';

        // Title with link
        const titleH3 = document.createElement('h3');
        titleH3.className = 'pub-title';

        const rawLink = typeof pub.link === 'string' ? pub.link.trim() : '';
        const isValidLink = rawLink.startsWith('http://') || rawLink.startsWith('https://');

        if (isValidLink) {
            const titleA = document.createElement('a');
            titleA.href = rawLink;
            titleA.target = '_blank';
            titleA.rel = 'noopener';
            titleA.textContent = pub.title || 'Untitled publication';
            titleH3.appendChild(titleA);
        } else {
            titleH3.textContent = pub.title || 'Untitled publication';
        }
        card.appendChild(titleH3);

        // Authors
        if (Array.isArray(pub.authors) && pub.authors.length > 0) {
            const authorsP = document.createElement('p');
            authorsP.className = 'pub-authors';
            const authorStr = pub.authors.slice(0, 4).join(', ') + (pub.authors.length > 4 ? ', et al.' : '');
            authorsP.textContent = authorStr;
            card.appendChild(authorsP);
        }

        // Venue / Journal
        if (pub.journal || pub.publisher) {
            const venueP = document.createElement('p');
            venueP.className = 'pub-venue';
            venueP.textContent = pub.journal || pub.publisher || '';
            card.appendChild(venueP);
        }

        // Meta tags (Year, Citations)
        const metaRow = document.createElement('div');
        metaRow.className = 'pub-meta-row';

        // Date / Year
        let yearStr = '';
        if (Array.isArray(pub.date) && pub.date.length > 0) {
            yearStr = String(pub.date[0]);
        } else if (typeof pub.date === 'string' || typeof pub.date === 'number') {
            yearStr = String(pub.date);
        }

        if (yearStr) {
            const yearTag = document.createElement('span');
            yearTag.className = 'pub-meta-tag';
            yearTag.textContent = yearStr;
            metaRow.appendChild(yearTag);
        }

        // Citations
        const rawCites = pub.citations;
        const citeNum = parseInt(rawCites, 10);
        if (!isNaN(citeNum) && citeNum > 0) {
            const citeTag = document.createElement('span');
            citeTag.className = 'pub-meta-tag pub-citations';
            citeTag.textContent = `${citeNum} citations`;
            metaRow.appendChild(citeTag);
        }

        card.appendChild(metaRow);
        return card;
    }

    function renderPublications(publications) {
        if (!pubContainer) return;
        if (loadFailed) {
            renderFallback();
            return;
        }

        pubContainer.innerHTML = '';

        if (!publications || publications.length === 0) {
            const emptyP = document.createElement('p');
            emptyP.className = 'loading-state';
            emptyP.textContent = 'No matching publications found.';
            pubContainer.appendChild(emptyP);
            return;
        }

        publications.forEach(pub => {
            pubContainer.appendChild(createPublicationCard(pub));
        });
    }

    // Fetch local gscholar.json
    if (pubContainer) {
        fetch('data/gscholar.json')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    loadedPublications = data;
                    renderPublications(loadedPublications);
                    const metricPubs = document.getElementById('metric-pubs');
                    if (metricPubs) {
                        metricPubs.textContent = `${loadedPublications.length}+`;
                    }
                } else {
                    renderFallback();
                }
            })
            .catch(err => {
                console.warn('Could not load data/gscholar.json, rendering fallback.', err);
                renderFallback();
            });

        // Search Filter
        if (pubSearch) {
            pubSearch.addEventListener('input', (e) => {
                if (loadFailed) return;
                const query = e.target.value.toLowerCase().trim();
                if (!query) {
                    renderPublications(loadedPublications);
                    return;
                }

                const filtered = loadedPublications.filter(pub => {
                    const title = (pub.title || '').toLowerCase();
                    const journal = (pub.journal || '').toLowerCase();
                    const authors = Array.isArray(pub.authors) ? pub.authors.join(' ').toLowerCase() : '';
                    return title.includes(query) || journal.includes(query) || authors.includes(query);
                });

                renderPublications(filtered);
            });
        }
    }
});
