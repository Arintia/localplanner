# LocalPlanner 🚀

**LocalPlanner** is a premium, offline-first Kanban board application built for professionals who value data sovereignty and simplicity. Wrapped in Electron, it provides a native desktop experience with a focused, distraction-free design.

![LocalPlanner UI](https://localplanner-landing.vercel.app/localplanner_main.webp)

## ✨ Features

- 🏗️ **Multi-Project Support**: Manage multiple boards with easy tab navigation.
- 🗂️ **Nested Categories**: Organize your tasks into logical categories and columns.
- 🧘 **Zen Focus Mode**: Immersive distraction-free environment for deep work.
- ↩️ **Unlimited Undo/Redo**: Mistake-proof your workflow with full state history.
- 📝 **Markdown Integration**: Rich text support for task descriptions.
- 🕰️ **Deadline Tracking**: Visual indicators for overdue and ending-soon tasks.
- 🌗 **Premium Dark Mode**: Curated color palettes for both light and dark aesthetics.
- 🔒 **Privacy First**: All data is stored locally in your browser/app. No cloud, no tracking.
- 📦 **Desktop Native**: Powered by Electron for a standalone application experience.

## 🛠️ Technical Stack

- **Core**: React 19 + Vite 6
- **Styling**: Tailwind CSS 4
- **Desktop**: Electron
- **Drag & Drop**: @hello-pangea/dnd
- **State**: Custom Hooks with LocalStorage persistence

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Arintia/localplanner.git
   ```
2. Navigate to the project directory:
   ```bash
   cd localplanner
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

- **Web Development**:
  ```bash
  npm run dev
  ```
- **Electron Desktop Development**:
  ```bash
  npm run electron:dev
  ```

### Building for Production

- **Build Desktop Installer**:
  ```bash
  npm run electron:build
  ```
  The installers will be generated in the `dist_electron` directory.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Since this is an open-source project, we value:
- Clean Code principles.
- Modular component design.
- Comprehensive documentation.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
