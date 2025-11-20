# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/255b3323-4286-4245-b12f-bdec8eed62bd

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/255b3323-4286-4245-b12f-bdec8eed62bd) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/255b3323-4286-4245-b12f-bdec8eed62bd) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

PathFinder AI – Frontend
React + Vite + TypeScript + Tailwind + ShadCN
🎯 Purpose

Frontend provides:

✔️ Chat UI
✔️ Conversation handling
✔️ User auth pages
✔️ Report display system
✔️ Context-based state (theme, user, messages)
✔️ API integration with backend

🧱 Folder Structure
src/
components/
chat/
ui/
pages/
Chat.tsx
Login.tsx
Report.tsx
context/
AppContext.tsx
lib/
hooks/

🔥 Core Features
✔️ Chat system with message auto-scroll
✔️ AI typing indicator
✔️ Auto theme switching
✔️ Authentication stored in localStorage
✔️ Report system (final AI output)
✔️ Career analysis visual display
🔗 API Configuration

.env (frontend):

VITE_API_URI=http://localhost:5000

🚀 Run Frontend
npm install
npm run dev

🌈 Chat Flow

User types message

Frontend sends message → backend

Backend AI responds with JSON

Frontend displays ai_message and the next_question if available

Report is saved when finalReport exists
