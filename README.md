# HalaMama Admin Dashboard & RouteMyOrder cPanel Deployment Guide

This repository contains two core React applications designed to manage HalaMama's end-to-end Last Mile Delivery (LMD) workflows:
1. **Admin Dashboard**: A TypeScript + React application using TanStack Router for operational dispatchers, managers, and admins.
2. **RouteMyOrder (RMO) Mobile App**: A JavaScript + React application using React Router for frontline warehouse Pickers, Packers, and Drivers.

Both applications are configured as single-page applications (SPAs) and are fully prepared for static file hosting on a cPanel Apache web server environment.

---

## 1. Server & System Requirements

Since both applications compile to static HTML, CSS, and JS client-side files, the hosting requirements on the server side are extremely lightweight:

*   **Web Server**: Apache Web Server (standard on cPanel) with `mod_rewrite` enabled to support SPA routing.
*   **SSL Certificate**: Required (HTTPS) for secure communications and location permissions for the driver navigation features.
*   **PHP/Node.js (Server Runtime)**: **Not required on the production server**. All business logic runs in the client browser, directly connecting to ERPNext REST API endpoints or simulating database storage locally via `localStorage`.
*   **Build Environment (Local/CI/CD)**: Node.js (version 18.x or 20.x) and npm (version 9.x or higher) are required to compile production builds before uploading.

---

## 2. Database & API Architecture

This system uses a decoupled, dual-mode data system:

1.  **Demo Mode (`VITE_USE_MOCK_DATA=true`)**:
    *   Uses the browser’s `localStorage` as a unified database shared across tabs.
    *   No physical database setup (like MySQL/PostgreSQL) is required on cPanel.
    *   Updates synchronize instantly using browser-level storage event signals.
2.  **Live Production Mode (`VITE_USE_MOCK_DATA=false`)**:
    *   Communicates directly with the **ERPNext REST API** backend server.
    *   Database records (Sales Orders, Custom Pickers, Packers, Drivers, Bags) reside in ERPNext. No local database is required on cPanel.

---

## 3. Local/Build Environment Configuration

Environment variables must be configured before building the applications. Create `.env` files based on the examples:

### Root Application (`.env` in root folder)
Copy `.env.example` to `.env` and configure:
```env
# Set to "true" to use built-in demo/dummy data; set to "false" to connect to ERPNext API
VITE_USE_MOCK_DATA=true

# ERPNext site URL (no trailing slash)
VITE_ERPNEXT_URL=https://your-erpnext-domain.com

# ERPNext User API Credentials
VITE_ERPNEXT_API_KEY=your_api_key_here
VITE_ERPNEXT_API_SECRET=your_api_secret_here
```

### RouteMyOrder Application (`.env` in `route-my-order` folder)
Copy `route-my-order/.env.example` to `route-my-order/.env` and configure:
```env
VITE_USE_MOCK_DATA=true
VITE_ERPNEXT_URL=https://your-erpnext-domain.com
VITE_ERPNEXT_API_KEY=your_api_key_here
VITE_ERPNEXT_API_SECRET=your_api_secret_here
```

---

## 4. Build Commands

To prepare the production bundles, follow these steps locally:

1.  **Install root dependencies**:
    ```bash
    npm install
    ```
2.  **Install RouteMyOrder dependencies**:
    ```bash
    cd route-my-order
    npm install
    cd ..
    ```
3.  **Compile production builds**:
    Run the unified build command to build both projects and combine them into a single `dist` directory structure:
    ```bash
    npm run build:all
    ```
    *(If the `build:all` script is not configured, run `npm run build` in the root, and `npm run build` in `route-my-order`, then copy the contents of `route-my-order/dist` into `dist/route-my-order/`)*.

---

## 5. cPanel Deployment Instructions

Follow these steps to deploy the combined static files directly to your cPanel hosting environment:

1.  **Locate/Generate the Combined Build Folder (`dist`)**:
    The build output is located in the root `dist` folder:
    *   Admin Dashboard: `dist/index.html` (corresponds to `/demo/order-management/`)
    *   RouteMyOrder: `dist/route-my-order/index.html` (corresponds to `/demo/order-management/route-my-order/`)
    *   Routing configuration: `dist/.htaccess`

2.  **Compress the `dist` folder**:
    Compress the contents of the `dist` folder (or the root project containing the `dist` folder) into a ZIP archive.

3.  **Upload via cPanel File Manager**:
    *   Log in to your cPanel dashboard.
    *   Open **File Manager** and navigate to your web root (usually `public_html`).
    *   Create the target sub-directories `demo` and `order-management` inside it so the path reads: `public_html/demo/order-management/`.
    *   Upload the compiled ZIP file contents directly inside `public_html/demo/order-management/`.
    *   Extract the contents.

4.  **Verify the Apache `.htaccess` File**:
    Ensure there is an `.htaccess` file inside `public_html/demo/order-management/` with the following rewrite rules to redirect clean URLs back to the SPAs:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      
      # Rewrite Rule for RouteMyOrder App
      RewriteCond %{REQUEST_URI} ^/demo/order-management/route-my-order/
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule ^(.*)$ /demo/order-management/route-my-order/index.html [L]

      # Rewrite Rule for Admin Dashboard App
      RewriteCond %{REQUEST_URI} ^/demo/order-management/
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule ^(.*)$ /demo/order-management/index.html [L]
    </IfModule>
    ```

---

## 6. Post-Deployment Verification Checklist

1.  **Check HTTPS Connection**: Navigate to `https://your-domain.com/demo/order-management/` and verify the SSL padlock is visible.
2.  **Verify Admin Login**: Access the Admin Dashboard and verify you can view orders, user managers, and the dispatch map.
3.  **Verify RouteMyOrder Access**: Navigate to `https://your-domain.com/demo/order-management/route-my-order/` and log in with your operational credentials (e.g., `driver@rmo.qa` / `driver123`).
4.  **Test Client Routing**: Reload the page on internal routes (e.g. `/demo/order-management/route-my-order/history`) to confirm the `.htaccess` rules prevent 404 errors.
5.  **Test Call / Map Buttons**: Verify that the "Open In Maps" and "Call" buttons launch correctly on physical mobile devices and fallback gracefully if no data is found.

---

## 7. Troubleshooting & Notes

*   **White Screen / Path Errors**:
    If you see a blank page or console errors claiming assets failed to load, make sure the folder hierarchy matches the sub-directory exactly: `public_html/demo/order-management/`.
*   **404 on Page Refresh**:
    If reloading a sub-page gives a standard cPanel 404 page, make sure the `.htaccess` file was successfully uploaded to the server and is not hidden (cPanel File Manager hides dotfiles by default; check "Show Hidden Files" in settings).
*   **CORS Issues (Live Mode)**:
    If connecting to a live ERPNext instance, ensure that CORS is configured on the ERPNext server to allow incoming API requests from your cPanel domain name.
