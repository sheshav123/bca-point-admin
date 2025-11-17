# BCA Point Admin Panel

This is the web-based admin panel for managing the BCA Point study materials app.

## ✨ New Features

### 1. Password-Based Authentication
- Simple password login (no Google account required)
- Default password: `admin123`
- Change password in `app.js` by editing the `ADMIN_PASSWORD` constant

### 2. Nested Subcategories
- Create unlimited levels of subcategories
- Subcategories can be created under:
  - Categories (📁)
  - Other Subcategories (📂)
- Example hierarchy: Category > Subcategory > Sub-subcategory > Sub-sub-subcategory...

### 3. Edit Functionality
- Edit titles, descriptions, and order for:
  - Categories
  - Subcategories (all levels)
  - Study Materials
- Click the "Edit" button next to any item

## Features
- Add/Delete/Edit Categories
- Add/Delete/Edit Subcategories (with unlimited nesting)
- Upload/Delete/Edit Study Materials (PDFs)
- Password-based Authentication

## Setup Instructions

### 1. Configure Firebase
The Firebase configuration is already set up in `app.js`. If you need to change it:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 2. Change Admin Password
Edit `app.js` and update:

```javascript
const ADMIN_PASSWORD = 'your-secure-password';
```

### 3. Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Push the `admin_panel` folder contents to the repository
3. Go to repository Settings > Pages
4. Select the branch (usually `main`) and root folder
5. Click Save
6. Your admin panel will be available at: `https://yourusername.github.io/repository-name/`

### 4. Firebase Security Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true; // Since we're using password auth, adjust as needed
    }
  }
}
```

Set up Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /study_materials/{allPaths=**} {
      allow read: if true;
      allow write: if true; // Since we're using password auth, adjust as needed
    }
  }
}
```

## Usage

1. Open the admin panel (index.html or deployed URL)
2. Enter the admin password
3. Use the tabs to manage:
   - **Categories**: Main subject categories
   - **Subcategories**: Topics within categories (can be nested infinitely)
   - **Study Materials**: Upload PDF files

## How Nested Subcategories Work

When creating a subcategory, you can select any category or existing subcategory as the parent. The system will:
- Show the full path (e.g., "Math > Algebra > Linear Equations")
- Allow materials to be added to any level
- Display the hierarchy clearly in the interface

## Security Notes

- The password is stored in plain text in the JavaScript file
- For production use, consider implementing proper server-side authentication
- The current setup uses sessionStorage, so login persists only for the current browser session
- Adjust Firebase security rules based on your security requirements

