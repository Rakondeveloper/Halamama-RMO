# HalaMama cPanel Deployment Walkthrough

This document outlines the steps to deploy the HalaMama Dashboard and the RouteMyOrder application on cPanel using the generated ZIP archives.

---

## 1. Generated Deployment Files

Two ZIP archives have been generated in your project root:

1. **`halamama-cpanel-dist-only.zip`** (Recommended)
   * **Contents**: Only the compiled, static assets of the **Admin Dashboard** and the **RouteMyOrder (RMO)** app, along with the router `.htaccess` rule file.
   * **Use Case**: Best for standard production deployment to prevent source code exposure.

2. **`halamama-cpanel-deployment.zip`**
   * **Contents**: The full source code repository *plus* the compiled `dist/` directory (excluding heavy system files like `node_modules` and `.git`).
   * **Use Case**: Useful if you need to keep a backup of the source files on your server.

---

## 2. Target Directory & Domain Structure

Based on the Vite configuration and the `.htaccess` rules, the applications are configured to run at the following URL paths:
* **Admin Dashboard**: `https://yourdomain.com/demo/order-management/`
* **RouteMyOrder App**: `https://yourdomain.com/demo/order-management/route-my-order/`

> [!IMPORTANT]
> If you upload the files to a different folder (e.g., directly to the root folder `public_html/`), the assets and routes might not resolve correctly. Make sure the folder path matches `/demo/order-management/` relative to your domain.

---

## 3. Step-by-Step cPanel Deployment Guide

Follow these steps to upload and extract the files:

### Step 1: Open File Manager in cPanel
1. Log in to your cPanel dashboard.
2. Search for and open the **File Manager**.

### Step 2: Create the Target Directory
1. Navigate to the root directory where your domain is hosted (usually `public_html`).
2. Inside `public_html`, create a folder named `demo` if it does not exist.
3. Inside `demo`, create a folder named `order-management`.
4. Navigate inside the `order-management` folder. The active path in File Manager should be:
   `public_html/demo/order-management/`

### Step 3: Upload the ZIP File
1. Click the **Upload** button in the cPanel File Manager toolbar.
2. Select the **`halamama-cpanel-dist-only.zip`** file from your computer.
3. Wait for the upload progress bar to reach 100% and turn green.

### Step 4: Extract the Zip File
1. Go back to the File Manager tab and click **Reload**.
2. Right-click on `halamama-cpanel-dist-only.zip` and select **Extract**.
3. Confirm the extraction path is `public_html/demo/order-management/` and click **Extract Files**.
4. Once extraction is complete, you can safely delete the uploaded `.zip` file from the server.

### Step 5: Verify Files
After extraction, your `/demo/order-management/` folder should contain the following items directly:
* `assets/` (folder containing dashboard CSS/JS)
* `route-my-order/` (folder containing RMO app assets)
* `index.html` (Admin dashboard main file)
* `.htaccess` (Apache routing rules)

---

## 4. Troubleshooting Routing Issues

If you navigate to sub-pages (e.g. `/demo/order-management/orders`) and get a **404 Not Found** error, ensure the `.htaccess` file was successfully extracted. In cPanel File Manager:
1. Click **Settings** in the top right corner.
2. Check the box for **Show Hidden Files (dotfiles)** and click **Save**.
3. Verify that the `.htaccess` file exists inside `public_html/demo/order-management/`.
