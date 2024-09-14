# Blogu
[![Visit My Website](https://img.shields.io/badge/Visit-My%20Website-blue?style=for-the-badge&logo=internet-explorer)](https://blogu-tsu6.onrender.com/)

Blogu is a multi-vendor blog system built using Node.js, Express.js, EJS templates, and MongoDB. It features a content management system with three distinct panels: a main website, a user panel, and a main admin panel. 

## Features

### Main Website
- **Content Display**: Shows data from the database with a dynamic navbar displaying categories. 
- **Content Preview**: Displays a limited description and image for each content. Users can click to view the full content.
- **User Authentication**: Provides login, signup, logout, and dashboard options. Logged-in users see personalized options.

### User Panel
- **User Dashboard**: After login, users are redirected to their dashboard where they can manage their posts and view categories.
- **Post Management**: Users can create, edit, delete, and sell their posts. 
- **Category Management**: Users can select categories from a dropdown list managed by the main admin. Users cannot create new categories.
- **Post Approval**: Created posts are sent to the main admin for approval before appearing on the main website.

### Main Admin Panel
- **User Management**: View and manage all user accounts.
- **Post Management**: Approve or delete posts created by users. Posts are not visible on the main website until approved.
- **Category Management**: Create or delete categories. Deleting a category removes all associated posts.
- **User Deletion**: Deleting a user also removes all posts created by the user.

## Technology Stack

- **Frontend**: EJS Templates
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Hosting**: Render (for the website), MongoDB Atlas (for the database)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/blogu.git
   ```

2. Navigate to the project directory:

   ```bash
   cd blogu
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add your MongoDB Atlas connection string:

   ```plaintext
   MONGODB_URI=your_mongodb_connection_string
   
   ```

5. Start the application:

   ```bash
   npm start
   ```

## Usage

- Visit the main website to browse and interact with blog content.
- Users can sign up, log in, and manage their posts through the user panel.
- Admins can manage users, posts, and categories through the admin panel.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact [anishkr2842003@gmail.com](mailto:anishkr2842003@gmail.com).
