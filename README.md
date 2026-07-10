# BirthdayProject

This is a static birthday surprise site. Instructions to push this project to GitHub and enable GitHub Pages for deployment.

1) Create a GitHub repository

- Option A — GitHub website:
  - Go to https://github.com/new, create a new repo (public or private).

- Option B — GitHub CLI (recommended if installed):
  ```bash
  gh repo create <your-username>/<repo-name> --public --source=. --remote=origin --push
  ```

2) From your project folder, initialize and push (if you used the website method):
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

3) Enable GitHub Pages (to host the static site)

- Via website: Settings → Pages → Source: `main` branch / `/ (root)` → Save.
- Via CLI:
```bash
gh pages setup --branch main --path /
```

4) Tips
- If push is refused due to authentication, use `gh auth login` or set up Git Credential Manager.
- Replace `assets/music/song.mp3` with your own MP3 if you want background music.

If you want, I can initialize the repo locally and push using the `gh` CLI (I will only provide the commands to run here). Let me know which username/repo name to use or whether you prefer manual setup.
