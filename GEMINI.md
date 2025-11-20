# Project Overview

This is a React-based web application that serves as the frontend for the "PathFinder AI" project. It allows users to upload pitch decks (in PDF or PPTX format) and receive an AI-powered analysis and validation report.

The application is built with the following technologies:

- **Framework:** React
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn-ui
- **Routing:** React Router
- **HTTP Client:** Axios

## Building and Running

To get the project up and running, follow these steps:

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    This will start the development server, and you can view the application at `http://localhost:8080`.

3.  **Build for Production:**

    ```bash
    npm run build
    ```

    This will create a `dist` directory with the production-ready files.

4.  **Lint the Code:**

    ```bash
    npm run lint
    ```

    This will run the linter to check for any code quality issues.

## Development Conventions

- The project uses TypeScript for static typing.
- Styling is done using Tailwind CSS and shadcn-ui components.
- The project follows the standard React project structure, with components, pages, and other files organized into separate directories.
- The application uses `axios` for making HTTP requests to the backend API.
- Routing is handled by `react-router-dom`.
- The entry point of the application is `src/main.tsx`.
- The main application component is `src/App.tsx`, which sets up the routing.
- The application consists of three main pages: `UploadPage`, `ReportsPage`, and `SpecificReportPage`.
- The `UploadPage` allows users to upload their pitch decks and view a summary of the analysis report.
- The backend API is expected to be running at `http://127.0.0.1:5000`.
