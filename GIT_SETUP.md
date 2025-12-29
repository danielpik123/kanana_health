# Git Repository Setup Guide

Follow these steps to upload your Kavana Health project to a new Git repository.

## Prerequisites

- Git installed on your computer
- A GitHub account (or GitLab, Bitbucket, etc.)
- Your project is ready (all code is complete)

## Step 1: Verify Your .gitignore File

Your `.gitignore` file is already configured to exclude:
- `node_modules/` (dependencies)
- `.env*` files (environment variables with API keys)
- `.next/` (Next.js build files)
- Other temporary files

**IMPORTANT:** Never commit `.env.local` or any file containing API keys!

## Step 2: Check Current Git Status

Open your terminal in the project directory and run:

```bash
cd "/Users/danielpik/VS Code Projects/kavana"
git status
```

This will show you what files are tracked, modified, or untracked.

## Step 3: Stage All Files

Add all your project files to Git:

```bash
git add .
```

This adds all files (respecting `.gitignore`).

## Step 4: Create Initial Commit

Commit all your files:

```bash
git commit -m "Initial commit: Kavana Health - Health Optimization Platform"
```

## Step 5: Create a New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name:** `kavana-health` (or your preferred name)
   - **Description:** "Premium health optimization and biomarker tracking platform"
   - **Visibility:** Choose **Private** (recommended) or **Public**
   - **DO NOT** initialize with README, .gitignore, or license (you already have these)
4. Click **"Create repository"**

## Step 6: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/kavana-health.git

# Verify the remote was added
git remote -v
```

## Step 7: Push Your Code to GitHub

Push your code to the main branch:

```bash
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password (or use a Personal Access Token).

## Step 8: Verify Upload

1. Go to your GitHub repository page
2. You should see all your files there
3. Verify that `.env.local` is NOT in the repository (it should be excluded)

## Important Security Notes

### Before Pushing:

1. **Double-check that `.env.local` is NOT tracked:**
   ```bash
   git ls-files | grep .env
   ```
   This should return nothing. If it shows `.env.local`, remove it:
   ```bash
   git rm --cached .env.local
   git commit -m "Remove .env.local from tracking"
   ```

2. **Verify sensitive files are ignored:**
   - `.env.local` ✅
   - `.env` ✅
   - `node_modules/` ✅
   - `.next/` ✅

3. **Create `.env.local.example`** (if you haven't already) to show what environment variables are needed without exposing actual values.

## Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/kavana-health.git
```

### If you need to update the remote URL:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/kavana-health.git
```

### If you get authentication errors:
- Use a Personal Access Token instead of password
- Generate one: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Use the token as your password when pushing

## Next Steps After Upload

1. **Set up environment variables** in your deployment platform (Vercel, Netlify, etc.)
2. **Enable branch protection** (optional, for production)
3. **Add collaborators** if working with a team
4. **Set up CI/CD** for automatic deployments

## Commands Summary

```bash
# Navigate to project
cd "/Users/danielpik/VS Code Projects/kavana"

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit: Kavana Health - Health Optimization Platform"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/kavana-health.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

**Remember:** Never commit API keys, passwords, or sensitive data!

