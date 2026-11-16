# Ajay Vishwakarma — Portfolio

A fast, static portfolio (plain HTML, CSS and JavaScript — no build step) with a technical terminal / HUD look.

## Structure

```
portfolio/
├── index.html      # all sections: home, about, skills, projects, credentials, contact
├── style.css       # theme and layout
├── script.js       # typing effect, scroll reveal, background, nav, mouse parallax
├── portrait.js     # interactive particle portrait (mouse scatter, scroll burst)
├── particles-data.js # precomputed pixel positions of your photo for the portrait
├── vercel.json     # static hosting config
└── assets/
    └── profile.jpg # your photo (fallback if JavaScript is off)
```

## Preview locally

Open `index.html` in a browser, or run a tiny server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Push to GitHub

```bash
cd portfolio
git init
git add .
git commit -m "Add portfolio"
git branch -M main
git remote add origin https://github.com/Ajay2309/portfolio.git
git push -u origin main
```

Create the empty `portfolio` repository on GitHub first (no README, no .gitignore).

## Deploy on Vercel

1. Go to https://vercel.com/new and import the `portfolio` GitHub repository.
2. Framework Preset: **Other**. Leave build command and output directory empty.
3. Click **Deploy**. Every push to `main` redeploys automatically.

Or with the CLI: `npm i -g vercel`, then run `vercel --prod` inside this folder.

## Editing content

- Text, projects, certifications and links: `index.html`
- Colors: CSS variables at the top of `style.css` (`--accent`, `--bg`, …)
- Typing-effect phrases: `phrases` array at the top of `script.js`
- Particle portrait feel: `K` (spring-back speed), `DAMP`, `R` (scatter radius) and `push` (scatter strength) in `portrait.js`
- Changing the photo: the portrait is baked into `particles-data.js`, so send the new photo and the data file needs regenerating
