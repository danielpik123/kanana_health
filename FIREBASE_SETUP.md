# Firebase Setup Guide

Follow these steps to configure Firebase for Kavana Health:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `kavana-health` (or your preferred name)
4. Click **Continue**
5. **Disable** Google Analytics (optional, you can enable later)
6. Click **Create project**
7. Wait for project creation to complete, then click **Continue**

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) or **"Add app"** → **Web**
2. Register your app:
   - App nickname: `Kavana Health Web` (or any name)
   - **Do NOT** check "Also set up Firebase Hosting" (unless you want it)
3. Click **Register app**
4. You'll see your Firebase configuration object - **copy these values** (you'll need them in Step 4)

## Step 3: Enable Authentication

1. In the Firebase Console, go to **Build** → **Authentication** (left sidebar)
2. Click **Get started**
3. Enable **Email/Password**:
   - Click on **Email/Password**
   - Toggle **Enable** for "Email/Password"
   - Click **Save**
4. Enable **Google Sign-In**:
   - Click on **Google**
   - Toggle **Enable**
   - Enter a project support email (your email)
   - Click **Save**

## Step 4: Get Your Firebase Config

You should have seen the config when registering your app. If not:

1. In Firebase Console, go to **Project Settings** (gear icon next to "Project Overview")
2. Scroll down to **"Your apps"** section
3. Click on your web app
4. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Add Config to Your App

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add your Firebase config values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
```

**Important:** Replace all the placeholder values with your actual Firebase config values!

## Step 6: Restart Your Dev Server

After adding the `.env.local` file:

1. Stop your dev server (Ctrl+C in terminal)
2. Start it again: `npm run dev`
3. The app should now connect to Firebase!

## Step 7: Test Authentication

1. Go to `http://localhost:3000`
2. You should be redirected to `/login`
3. Try creating an account with email/password
4. Or try signing in with Google

## Troubleshooting

- **"Firebase not configured" error**: Make sure your `.env.local` file has all the correct values and you've restarted the dev server
- **Google Sign-In not working**: Make sure you've enabled Google authentication in Firebase Console
- **Email/Password not working**: Make sure Email/Password authentication is enabled in Firebase Console

## Optional: Set Up Firestore (for future data storage)

1. Go to **Build** → **Firestore Database**
2. Click **Create database**
3. Start in **test mode** (for development)
4. Choose a location (closest to your users)
5. Click **Enable**

Note: The app currently uses mock data, but Firestore can be used later to store real user data.

