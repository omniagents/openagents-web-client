# OpenAgents Web Client

A web client for the OpenAgents network.

## Features

- Connect to OpenAgents networks
- Send direct messages to agents
- Broadcast messages to all agents
- View and manage agent connections
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/openagents-web-client.git
cd openagents-web-client
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Building for Production

### Static Export

This project can be built as static HTML/CSS/JS files that can be deployed to any static hosting service.

1. Build the static files
```bash
npm run build
# or
yarn build
```

2. The static files will be generated in the `out` directory

### Deploying Static Files

You can deploy the static files to any static hosting service like:

- GitHub Pages
- Netlify
- Vercel
- Amazon S3
- Cloudflare Pages

Example deployment to GitHub Pages:

1. Push your code to a GitHub repository
2. Configure GitHub Pages to serve from the `out` directory
3. Or use a GitHub Action to automate the deployment process

## Environment Variables

No environment variables are required for the static build.

## Browser Support

The application supports all modern browsers:

- Chrome
- Firefox
- Safari
- Edge

## License

This project is licensed under the MIT License - see the LICENSE file for details.
