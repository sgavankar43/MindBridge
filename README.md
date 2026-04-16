
MindBridge – Bridging the Gap to Mental Wellness

MindBridge is an all-encompassing digital mental health ecosystem designed to provide accessible, affordable, and scalable psychological support. Built on the **MERN stack**, the platform integrates AI-driven conversational therapy with a hybrid care model that allows users to connect with real therapists via audio, video, or chat on a flexible **pay-per-use** basis.
Our mission is to democratize mental health support, reduce social stigma, and provide early intervention through a data-driven approach to emotional well-being.
Key Features
1. Hybrid Support Ecosystem
   24/7 AI Companion:** Instant conversational therapy for immediate distress management and mood regulation.
   Professional Consultations:** Seamless escalation to licensed human therapists via **WebRTC-powered** high-definition video, audio calls, or encrypted messaging.

2. Wellness & Engagement Tools
    Mood & Goal Tracking:** Daily monitoring of emotional patterns and personalized mental health goal setting.
    Therapeutic Gamification:** Cognitive games (Bubble Pop, Memory Match, 2048) designed to reduce stress and improve mindfulness.
    Community Support:** A secure forum for peer-to-peer engagement and shared healing.

3. Financial Accessibility (Pay-Per-Use)
    Wellness Wallet:** A prepaid credit system that eliminates expensive monthly subscriptions.
    Transparent Pricing:** Professional sessions starting as low as ₹800, making high-quality care accessible to students and low-income individuals.

4. Enterprise-Grade Security
    Privacy-First:** Secure JWT-based authentication and end-to-end data encryption.
    Modular Scalability:** Optimized for horizontal scaling to handle high traffic and global user distribution.

Tech Stack

  Frontend: React.js, Tailwind CSS, Lucide React (Icons).
  Backend: Node.js, Express.js.
  Database: MongoDB (with Mongoose ODM).
  Communication: WebRTC (for real-time audio/video), Socket.io (for instant chat).
  Tools: Vite (Build tool), Cloudinary (Image management).



Project Structure

```text
mindbridge/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components (shadcn/ui)
│   │   ├── pages/          # Dashboard, Community, Wallet, Games, etc.
│   │   ├── context/        # Global state management
│   │   └── hooks/          # Custom React hooks
├── server/                 # Node.js/Express backend
│   ├── controllers/        # Business logic for Auth, Wallet, AI, etc.
│   ├── models/             # Mongoose schemas (User, Post, Transaction)
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth and Error handling
│   └── scripts/            # Database seeding and verification
└── README.md
```

---

Getting Started

Prerequisites
 Node.js (v16+)
 MongoDB Atlas account or local installation
 Cloudinary account (for profile/post images)

Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/mindbridge.git
    cd mindbridge
    ```

2.  Setup the Server:
    ```bash
    cd server
    npm install
    # Create a .env file based on .env.example
    npm start
    ```

3.  Setup the Client:
    ```bash
    cd ../client
    npm install
    # Create a .env file based on .env.example
    npm run dev
    ```
