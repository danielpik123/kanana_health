# Kavana Health

Premium health optimization and biomarker tracking platform built with Next.js.

## Features

- 🔐 **Authentication** - Firebase Auth with Email/Password and Google Sign-in
- 📊 **Biomarker Tracking** - Upload PDF blood tests, extract data with AI (GPT-4 Vision)
- 📈 **Data Visualization** - Trend graphs and visual scales for biomarker analysis
- 🤖 **AI Health Consultant** - GPT-4o powered chat assistant for health insights
- 💬 **Conversation History** - Persistent chat history with auto-naming and management
- 📱 **Wearables Integration** - Support for Oura Ring and Garmin (coming soon)
- 🛒 **Shop** - Supplement packs and health hardware

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **AI:** OpenAI GPT-4o & GPT-4 Vision
- **Charts:** Recharts
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/kavana-health.git
cd kavana-health
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase and OpenAI credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
OPENAI_API_KEY=your-openai-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setup Guides

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Git Repository Setup](./GIT_SETUP.md)

## Project Structure

```
kavana/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (backend)
│   ├── (auth)/           # Authentication pages
│   └── (dashboard)/      # Protected dashboard pages
├── components/            # React components
│   ├── ai-consultant/    # Chat interface components
│   ├── data-vault/       # Biomarker & wearable components
│   ├── dashboard/         # Dashboard components
│   └── ui/               # Shadcn/UI components
├── lib/                   # Utility libraries
│   ├── firebase/         # Firebase services
│   └── openai/           # OpenAI integration
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## Key Features

### PDF Blood Test Upload
- Upload PDF lab reports
- AI-powered extraction using GPT-4 Vision
- Automatic biomarker parsing and categorization
- Trend visualization over time

### AI Health Consultant
- GPT-4o powered health specialist
- Context-aware responses using user's biomarker data
- Conversation history with auto-naming
- Persistent chat sessions

### Data Vault
- View all biomarker tests
- Compare tests over time
- Visual scales showing optimal/sub-optimal/danger zones
- Statistical trend graphs

## Environment Variables

See `.env.local.example` for all required environment variables.

**Important:** Never commit `.env.local` to version control!

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

See [Vercel documentation](https://vercel.com/docs) for more details.

## License

Private - All rights reserved

## Support

For issues and questions, please open an issue on GitHub.
