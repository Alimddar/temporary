# Client Folder Structure

This document describes the organized structure of the client folder.

## Directory Structure

```
client/
├── index.html                  # Root redirect file
├── server.js                   # Development server
├── package.json               # Node.js dependencies
├── PROJECT_STRUCTURE.md       # This file
│
├── assets/                    # All static assets
│   ├── css/                  # Compiled CSS files
│   │   ├── index.css        # Main page styles (fixed path)
│   │   └── register.css     # Registration page styles (fixed path)
│   │
│   ├── js/                   # JavaScript files
│   │   └── menu-action.js   # Menu functionality
│   │
│   ├── scss/                 # SCSS source files
│   │   ├── _bottom.scss     # Footer styles
│   │   ├── _common.scss     # Common styles
│   │   ├── _header.scss     # Header styles
│   │   ├── index.scss       # Main page SCSS
│   │   └── register.scss    # Registration SCSS
│   │
│   └── images/              # All images
│       ├── covers/          # Cover images and banners
│       ├── games/           # Game thumbnails
│       ├── logos/           # Company and provider logos
│       ├── icons/           # UI icons
│       └── payment-methods/ # Payment method logos
│
├── pages/                    # All HTML pages
│   ├── admin/               # Admin dashboard pages
│   │   └── dashboard.html   # Admin dashboard
│   │
│   ├── auth/                # Authentication pages
│   │   ├── login.html      # Admin login page
│   │   └── register.html   # User registration
│   │
│   ├── user/                # User-facing pages
│   │   └── index.html      # Main landing page
│   │
│   ├── payment/             # Payment-related pages
│   │   └── card-deposit.html # Card deposit page
│   │
│   └── debug/               # Debug/test pages
│       ├── debug.html      # Debug page
│       └── tmp.html        # Temporary test page
│
└── components/              # Reusable components (future use)

```

## File Organization Guidelines

1. **HTML Files**: All HTML files are organized in the `pages/` directory by functionality
2. **CSS Files**: Compiled CSS goes in `assets/css/`, source SCSS in `assets/scss/`
3. **JavaScript**: All JS files go in `assets/js/`
4. **Images**: Organized by type in `assets/images/` subdirectories
5. **Components**: Reserved for future reusable components

## Path References

When referencing assets from HTML files in the pages directory:
- Use `../../assets/css/` for CSS files (FIXED: removed extra `/index/` and `/register/` folders)
- Use `../../assets/js/` for JavaScript files (FIXED: updated menuAction.js to menu-action.js)
- Use `../../assets/images/` for images (FIXED: updated all old `./img/` references)

## Recent Fixes Applied

1. **CSS Path Fix**: Changed from `../../assets/css/index/index.css` to `../../assets/css/index.css`
2. **CSS Path Fix**: Changed from `../../assets/css/register/index.css` to `../../assets/css/register.css`
3. **JS Path Fix**: Changed from `../../assets/js/menuAction.js` to `../../assets/js/menu-action.js`
4. **Image Path Fix**: Updated all old `./img/section/logo.png` references to `../../assets/images/logos/logo.png`
5. **Navigation Fix**: All inter-page navigation links updated to use correct relative paths

## Development Server

The development server (`server.js`) serves files from port 5500 and handles the new directory structure automatically.