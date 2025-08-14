# Smart Taxis MVP

A comprehensive taxi booking and management system built with Node.js, Express, and EJS. This MVP demonstrates a complete taxi service platform with real-time features, driver management, and booking capabilities.

## 🚀 Features

### Core Functionality
- **Client Booking System**: Easy-to-use booking form with fare estimation
- **Driver Assignment**: Automatic driver assignment based on availability
- **Mission Execution**: Real-time mission tracking and status updates
- **Driver Management**: Comprehensive driver dashboard with performance metrics
- **Web Interface**: Modern, responsive UI built with Bootstrap 5
- **Console Notifications**: Real-time status updates and notifications

### Technical Features
- **RESTful API**: Clean API endpoints for all operations
- **Real-time Updates**: Auto-refreshing data and status indicators
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Performance**: Optimized for fast loading and smooth interactions

## 🛠 Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: EJS templating with Bootstrap 5
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **JavaScript**: Vanilla ES6+ for client-side interactions
- **Icons**: Bootstrap Icons
- **Development**: Nodemon for hot reloading

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Yun12-yu/smart_raid.git
cd smart_raid
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
smart_raid/
├── app.js                 # Main application file
├── package.json           # Project dependencies and scripts
├── README.md             # Project documentation
├── public/               # Static assets
│   ├── css/
│   │   └── style.css     # Custom styles
│   └── js/
│       └── app.js        # Client-side JavaScript
├── views/                # EJS templates
│   ├── layout.ejs        # Main layout template
│   ├── index.ejs         # Home page
│   ├── booking.ejs       # Booking form
│   ├── booking-success.ejs # Booking confirmation
│   ├── missions.ejs      # Mission management
│   └── drivers.ejs       # Driver management
└── Smart_Taxis_MVP_CI_CD_Specification.md # Technical specification
```

## 🌐 API Endpoints

### Web Routes
- `GET /` - Home dashboard
- `GET /book` - Booking form
- `POST /book` - Submit booking
- `GET /missions` - Mission management
- `GET /drivers` - Driver management

### API Routes
- `GET /api/status` - System status
- `GET /api/mission/:id` - Mission details
- `GET /api/drivers` - Driver list
- `GET /api/bookings` - Booking list

## 🎨 UI Components

### Dashboard
- Real-time statistics
- Available drivers count
- Active missions overview
- Quick action buttons

### Booking System
- Interactive booking form
- Real-time fare estimation
- Phone number formatting
- Form validation

### Mission Management
- Active mission tracking
- Mission history
- Status timeline
- Performance metrics

### Driver Management
- Driver availability status
- Performance ratings
- Location tracking
- Assignment capabilities

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## 🚀 Deployment

### Using Dokploy (Recommended)

1. **Setup Dokploy Server**
   - Install Dokploy on your server
   - Configure domain and SSL

2. **Connect Repository**
   - Link your GitHub repository
   - Configure build settings

3. **Deploy**
   ```bash
   # Dokploy will automatically deploy on git push
   git push origin main
   ```

### Manual Deployment

1. **Build for Production**
   ```bash
   npm install --production
   ```

2. **Start Application**
   ```bash
   npm start
   ```

3. **Use Process Manager**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start app.js --name "smart-taxis"
   ```

## 🔄 CI/CD Pipeline

The project includes a complete CI/CD workflow:

### Development Workflow
1. Code in VS Code
2. Commit to Git
3. Push to GitHub
4. Automatic deployment via Dokploy

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Dokploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Dokploy
        run: |
          # Dokploy webhook trigger
          curl -X POST ${{ secrets.DOKPLOY_WEBHOOK_URL }}
```

## 🧪 Testing

### Manual Testing
1. **Booking Flow**
   - Fill out booking form
   - Verify fare calculation
   - Check booking confirmation

2. **Driver Management**
   - View driver statuses
   - Test driver assignment
   - Verify real-time updates

3. **Mission Tracking**
   - Monitor active missions
   - Check status transitions
   - Verify completion flow

### Automated Testing (Future)
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📱 Mobile Support

The application is fully responsive and supports:
- Touch interactions
- Mobile-optimized layouts
- Offline capabilities (future)
- Progressive Web App features (future)

## 🔒 Security Features

- Input validation and sanitization
- CSRF protection (future)
- Rate limiting (future)
- Secure headers (future)
- Environment variable protection

## 🎯 Performance Optimizations

- Minified CSS and JavaScript
- Optimized images
- Lazy loading
- Caching strategies
- CDN integration (future)

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in package.json or use environment variable
   PORT=3001 npm run dev
   ```

2. **Dependencies Not Installing**
   ```bash
   # Clear npm cache
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Styles Not Loading**
   - Check if static files are served correctly
   - Verify CSS file paths
   - Clear browser cache

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when available)
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bootstrap team for the excellent CSS framework
- Express.js community for the robust web framework
- Node.js team for the runtime environment
- All contributors and testers

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Basic booking system
- ✅ Driver management
- ✅ Mission tracking
- ✅ Web interface

### Phase 2 (Future)
- 🔄 Real-time GPS tracking
- 🔄 Payment integration
- 🔄 Mobile app
- 🔄 Advanced analytics

### Phase 3 (Future)
- 🔄 AI-powered routing
- 🔄 Multi-language support
- 🔄 Advanced reporting
- 🔄 Third-party integrations

---

**Smart Taxis MVP** - Revolutionizing urban transportation, one ride at a time! 🚕✨