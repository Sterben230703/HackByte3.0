# 🔐 SAULT - Blockchain-Powered Document Management

Welcome to Sault, your trusted document management solution that leverages blockchain technology for secure, transparent, and efficient document handling.


<img src="./public/logo.png" alt="Sault Logo" width="100" />

## 🌟 Features

- 📑 **Secure Document Storage**: Store your documents with blockchain-backed security
- ✍️ **Document Signing**: Digital signature capabilities for legal documents
- 🏷️ **Smart Categorization**: Organize documents with intelligent categorization
- 📊 **Analytics Dashboard**: Track and analyze document metrics
- 🔒 **Wallet Integration**: Seamless connection with Aptos blockchain wallets
- ⚡ **Fast Retrieval**: Quick access to your stored documents
- 📱 **Responsive Design**: Works perfectly on both desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Components**: Radix UI
- **Blockchain**: Aptos Network
- **Charts**: Chart.js & Recharts
- **Routing**: React Router DOM
- **State Management**: React Context

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An Aptos-compatible wallet (like Petra or Martian)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sault
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill in the required environment variables in the `.env` file.

### Development

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📦 Project Structure

```
sault/
├── blockchain_0/        # Aptos smart contract code
├── frontend/
│   ├── components/      # React components
│   ├── utils/          # Utility functions
│   └── lib/            # Shared libraries
├── public/             # Static assets
└── scripts/            # Build and deployment scripts
```

## 💻 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run deploy`: Deploy to Vercel
- `npm run lint`: Run ESLint
- `npm run fmt`: Format code with Prettier
- `npm run move:init`: Initialize Move framework
- `npm run move:test`: Run Move tests
- `npm run move:compile`: Compile Move modules
- `npm run move:publish`: Publish Move modules

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](#)
- [Aptos Framework](https://aptos.dev/)
- [Live Demo](#)

---

Made with ❤️ by the Sault Team