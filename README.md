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
   - Python 3: Set up a virtual environment (Python >= 3.10 is required by StaffSpy) and install dependencies:
     ```bash
     python3.11 -m venv .venv
     source .venv/bin/activate
     pip install "staffspy[browser]"
     ```

2. **Fetch Data Locally**
   ```bash
   npm run fetch-scholar               # Update Google Scholar publications
   python scripts/fetch_linkedin.py    # Update LinkedIn profile data (will open a browser on first run)
   ```

3. **Serve or Build**
   - The site is static—simply open `index.html` or deploy to GitHub Pages.

## Automating LinkedIn Refresh on GitHub Actions

Since LinkedIn requires browser authentication, GitHub Actions runs the scraper using your local session cookies stored in `data/session.pkl`. To set this up:

1. **Generate the Session File Locally**
   Run the LinkedIn script locally:
   ```bash
   python scripts/fetch_linkedin.py
   ```
   A browser window will open. Log into your LinkedIn account. Once logged in, go back to your terminal and press **Enter** to let the script finish and save `data/session.pkl` locally.

2. **Base64 Encode the Session File**
   Run the following command to encode `data/session.pkl` into a base64 string and copy it:
   - **macOS**:
     ```bash
     base64 -i data/session.pkl | pbcopy
     ```
   - **Linux / Git Bash**:
     ```bash
     base64 -w 0 data/session.pkl
     ```

3. **Add GitHub Secret**
   Go to your GitHub repository: **Settings > Secrets and variables > Actions > New repository secret**.
   - Name: `LINKEDIN_SESSION_B64`
   - Secret: *Paste the base64 string you copied.*

The monthly workflow will automatically decode this session cookie to run the scraper in non-interactive headless mode. If the session expires, the workflow will continue safely without blocking Google Scholar updates, and you will see an `EOFError` in the action log indicating you need to regenerate the session secret.

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
