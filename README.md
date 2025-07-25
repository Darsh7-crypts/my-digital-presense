# 🚀 Angular Portfolio

A modern, responsive portfolio website built with Angular 20, featuring server-side rendering (SSR) and a clean, professional design. This portfolio showcases professional experience, education, technical skills, achievements, and project highlights.

![Angular](https://img.shields.io/badge/Angular-20.0-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat-square&logo=bootstrap)
![Angular Material](https://img.shields.io/badge/Angular%20Material-20.1-blue?style=flat-square&logo=material-ui)

## ✨ Features

- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **⚡ Server-Side Rendering (SSR)** - Fast initial page loads and SEO optimization
- **🎨 Modern UI/UX** - Clean, professional design with Angular Material components
- **📊 Interactive Sections** - Dynamic content for projects, skills, and experience
- **🎯 Component-Based Architecture** - Modular and maintainable code structure
- **🔧 TypeScript** - Type-safe development with full TypeScript support

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── about/          # About section component
│   │   ├── achievement/    # Achievements showcase
│   │   ├── contact/        # Contact information
│   │   ├── education/      # Education timeline
│   │   ├── experience/     # Professional experience
│   │   ├── header/         # Navigation header
│   │   ├── home/           # Landing/hero section
│   │   ├── projects/       # Project portfolio
│   │   └── skills/         # Technical skills
│   └── services/
│       └── portfolio-data.ts # Portfolio data service
├── assets/                 # Static assets
└── public/                 # Public assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Angular CLI (optional, but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Darsh7-crypts/my-digital-presense.git
   cd my-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   
   Navigate to `http://localhost:4200/` in your browser. The application will automatically reload when you make changes.

## 🛠️ Available Scripts

- **`npm start`** - Start development server
- **`npm run build`** - Build for production
- **`npm test`** - Run unit tests
- **`npm run watch`** - Build in watch mode
- **`npm run serve:ssr:my-portfolio`** - Serve SSR build

## 🏗️ Building for Production

To build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, optimized for performance and speed.

### Server-Side Rendering (SSR)

This project includes SSR support for improved performance and SEO:

```bash
npm run build
npm run serve:ssr:my-portfolio
```

## 🧪 Testing

Run unit tests with Karma:

```bash
npm test
```

The project includes comprehensive test coverage for all components and services.

## 🛠️ Tech Stack

- **Frontend Framework**: Angular 20
- **Language**: TypeScript 5.8
- **UI Framework**: Angular Material 20.1 + Bootstrap 5.3
- **Styling**: CSS3 with component-scoped styles
- **Build Tool**: Angular CLI
- **Testing**: Jasmine + Karma
- **SSR**: Angular Universal

## 📱 Responsive Design

The portfolio is fully responsive and optimized for:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (< 768px)

## 🎨 Customization

### Portfolio Data
Update your personal information in `src/app/services/portfolio-data.ts`:

```typescript
// Update with your information
export const portfolioData = {
  personal: { /* your details */ },
  experience: [ /* your experience */ ],
  projects: [ /* your projects */ ],
  skills: [ /* your skills */ ]
};
```

### Styling
- Global styles: `src/styles.css`
- Component styles: Individual `.css` files for each component
- Theme customization: Angular Material theming in `src/app/app.css`

## 🌐 Deployment

The project can be deployed to various platforms:

- **Netlify/Vercel**: Deploy the `dist/` folder
- **GitHub Pages**: Use Angular CLI deployment tools
- **Traditional hosting**: Upload the built files to your web server

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact

Feel free to reach out if you have any questions or suggestions!

---

Built with ❤️ using Angular
