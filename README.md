# Personal Portfolio Website

A fully static, dark-themed personal portfolio website hosted on GitHub Pages. It dynamically fetches and displays:

- **GitHub Repositories:** Public repos sorted by recent activity via GitHub API.
- **Google Scholar Publications:** Pulled monthly via a Node.js CLI into `data/gscholar.json`.
- **LinkedIn Profile Data:** Fetched manually via a Python CLI into `data/linkedin.json`, including education, experiences, and top skills.

## Repository Structure

```
/ (root)
├── index.html           # Main page
├── css/                 # Stylesheets
│   └── styles.css
├── js/                  # Front-end scripts
│   └── scripts.js
├── data/                # Fetched JSON data
│   ├── gscholar.json
│   └── linkedin.json
├── scripts/             # Data fetcher CLIs
│   ├── fetch_scholar.js
│   └── fetch_linkedin.py
├── .github/             # GitHub Actions workflows
│   ├── workflows/
│   │   └── update-gscholar-monthly.yml
├── package.json         # Node.js project config
├── .gitignore
└── README.md            # This file
```

## Getting Started

1. **Install Dependencies**
   - Node.js: `npm install` (for the Scholar scraper)
   - Python 3: Create and activate a virtual environment, then `pip install staffspy[browser]`

2. **Fetch Data Locally**
   ```bash
   npm run fetch-scholar               # Update Google Scholar publications
   python scripts/fetch_linkedin.py    # Update LinkedIn profile data
   ```

3. **Serve or Build**
   - The site is static—simply open `index.html` or deploy to GitHub Pages.

## Site Sections

- **Hero:** Profile photo, name, and headline.
- **About:** Biography pulled from LinkedIn.
- **Education:** Academic history list.
- **Work:** Experience cards, location, dates.
- **Skills:** Top 3 skills as badges.
- **Repositories:** Latest GitHub repos.
- **Publications:** Key papers with metadata.
- **Contact:** Email (from LinkedIn), GitHub, LinkedIn, Scholar, ORCID.

---

*Built with HTML, CSS, JavaScript (vanilla), Node.js, Python, and GitHub Actions.*
