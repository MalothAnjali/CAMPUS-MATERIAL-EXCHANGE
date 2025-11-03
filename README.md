📘 Campus Materials Exchange
A modern, AI-powered platform for students and faculty to share, browse, and manage educational materials such as notes, assignments, and resources.
The app provides a Google Drive–style folder structure, role-based access, and integrated AI assistance for automatic tagging, summarization, and quiz generation.

🚀 Features
🔐 Authentication
Student signup and login with department and semester info.
Admin login (hidden credentials for system management).
Guest access for browsing without full privileges.

🧠 AI Integration
AI-powered tag generation for uploaded materials.
Integrated study assistant chatbot for PDFs — can summarize, quiz, and extract key points.

🗂 File Management
Organized by subject → unit → file hierarchy.
Upload, preview, rate, download, or delete materials.
Supports .pdf, .doc, .docx, .ppt, .pptx, and .txt.

👤 User Dashboard
Track uploads, downloads, and average ratings.
View and manage personal contributions.
Role-based features for admin and student users.

⚙ Admin Tools
Manage users and uploaded materials.
Moderate and maintain repository quality.

🎨 UI/UX
Built with Tailwind CSS and Lucide React Icons.
Dynamic dark gradient theme with responsive design.
Breadcrumb navigation and intuitive folder-based browsing.

🧩 Tech Stack
CategoryTechnologyFrontendReact (Hooks)StylingTailwind CSSIconsLucide ReactAI IntegrationCustom generateText() via Gemini APIState ManagementReact useState / useEffectStorageBrowser localStorageFile HandlingBlob URLs (for previews & downloads)

⚙ Installation & Setup
cd campus-materials-exchange
Install dependencies
npm install

Set up API
Create a file src/services/genApi.js with your AI API logic:
export async function generateText(prompt) {
  // Example using Gemini or OpenAI API
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  return await response.json();
}

Run the development server
npm run dev

Build for production
npm run build

🧑‍💻 Default Accounts
Role Email:Adminadmin@campus.com,password:admin123
🧱 Folder Structure
src/
├── App.jsx
├── services/
│   └── genApi.js
├── components/
│   ├── UploadForm.jsx
│   ├── BrowseSection.jsx
│   ├── PDFChatbot.jsx
│   └── ...
├── assets/
│   └── icons, styles, etc.

🤖 AI Features (Gemini Integration)
Generates intelligent tags for uploaded content.
In-PDF assistant can:
Summarize documents
Create quizzes
Highlight key points
Answer context-based questions

🧠 Future Improvements
Firebase/Node backend integration.
File persistence beyond localStorage.
Cloud storage (e.g., Google Drive API or AWS S3).
Multi-user collaboration and commenting.# CAMPUS-MATERIAL-EXCHANGE
 
