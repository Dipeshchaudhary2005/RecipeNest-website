# RecipeNest 🍳

A full-stack recipe management application built with the MERN stack (MongoDB, Express, React, Node.js). 

##  Features
- **User Authentication**: Secure login, registration, and password reset functionality via email.
- **Role-Based Access**: Distinct dashboards and capabilities for Regular Users, Chefs, and Administrators.
- **Recipe Management**: Create, view, edit, and delete detailed recipes with ingredients and steps.
- **File Uploads**: Easily attach and upload images for recipe demonstrations.

## Tech Stack
- **Frontend**: React.js, Axios (for API requests)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (using Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Email Service**: Nodemailer

---

##  Setup Guide for Beginners

Follow these step-by-step instructions to get the complete project running on your local machine.

### 1. Prerequisites
Make sure you have the following installed on your computer:
- [Git](https://git-scm.com/downloads) (to download the source code)
- [Node.js](https://nodejs.org/) (this will also install `npm`, which we need to install packages)

### 2. Get the Source Code from Git
Open your terminal (or Command Prompt/PowerShell) and clone the repository using Git:

```bash
# Clone the repository
git clone https://github.com/Dipeshchaudhary2005/RecipeNest-website.git

# Move into the project folder
cd RecipeNest-website
```

### 3. Backend Setup (The Server)

1. Make sure your terminal is currently in the root folder of the project.
2. Install all the necessary backend packages:
   ```bash
   npm install
   ```
3. Create a new file named `.env` in this root folder. Open it and paste the following environment variables (replace with your actual MongoDB URL and Email App Passwords):
   ```env
   DB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/recipeDB
   PORT=8080

   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=1d

   CLIENT_URL=http://localhost:3000

   # Email Configuration (for password resets)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   EMAIL_FROM="RecipeNest" your_email@gmail.com
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(You should see a message saying the server is running on port 8080 and connected to MongoDB).*

### 4. Frontend Setup (The User Interface)

1. Open a **new, second terminal window** (leave the backend running in the first one).
2. Navigate into the frontend directory:
   ```bash
   cd src/Frontend
   ```
3. Install all the necessary frontend packages:
   ```bash
   npm install
   ```
4. Start the React frontend:
   ```bash
   npm start
   ```
   *(Your web browser should automatically open to `http://localhost:3000`)*

### 5. You're All Set! 🎉
You can now interact with the website! Try registering a new user account, logging in, and exploring the dashboards.
