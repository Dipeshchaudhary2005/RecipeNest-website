import { useState, useEffect } from "react";
import "./styles/global.css";

// Pages
import HomePage from "./pages/HomePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import ExploreRecipesPage from "./pages/ExploreRecipesPage";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";

// User
import UserDashboardPage from "./pages/user/UserDashboardPage";

// Chef
import ChefDashboardPage from "./pages/chef/ChefDashboardPage";

// Admin
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

// Components
import Navbar from "./components/Navbar";

/**
 * RecipeNest — Full Multi-Role App
 *
 * Pages:
 *  "home"             → Public landing + recipe grid
 *  "recipe-detail"    → Single recipe view
 *  "login"            → Login (routes to role dashboard on submit)
 *  "signup"           → Register (role picker: user / chef)
 *  "forgot-password"  → 4-step password reset flow
 *  "user-dashboard"   → Saved recipes, favorites
 *  "chef-dashboard"   → My creations, analytics
 *  "admin-dashboard"  → User mgmt, recipes, analytics, reports
 */
export default function App() {
  // Initial State from localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [page, setPage] = useState("home");
  const [history, setHistory] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [search, setSearch] = useState("");

  // Sync theme with document and localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  // Custom navigation that tracks history
  const navigateTo = (nextPage) => {
    if (nextPage !== page) {
      setHistory(prev => [...prev, page]);
      setPage(nextPage);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevPage = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setPage(prevPage);
    } else {
      setPage("home");
    }
  };

  // Sync User state to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setPage("home");
    setHistory([]);
  };

  // Check if current page is an Auth Modal
  const isAuthModal = ["login", "signup", "forgot-password"].includes(page);
  
  // Dashboard routing helper
  const renderDashboard = () => {
    // If we have a user, show their specific dashboard
    if (user) {
      switch (user.role) {
        case "admin": return <AdminDashboardPage setPage={navigateTo} user={user} setUser={setUser} onLogout={handleLogout} />;
        case "chef": return <ChefDashboardPage setPage={navigateTo} setSelectedRecipe={setSelectedRecipe} user={user} setUser={setUser} onLogout={handleLogout} />;
        case "user": return <UserDashboardPage setPage={navigateTo} setSelectedRecipe={setSelectedRecipe} user={user} setUser={setUser} onLogout={handleLogout} />;
        default: return <HomePage setPage={navigateTo} setSelectedRecipe={setSelectedRecipe} search={search} setSearch={setSearch} />;
      }
    }
    
    // If no user is logged in, redirect to login modal
    return <LoginPage setPage={navigateTo} setUser={setUser} onBack={handleBack} />;
  };

  return (
    <>
      {/* Global Navbar (Always visible on non-dashboard pages) */}
      {!page.includes("-dashboard") && (
        <Navbar 
          setPage={navigateTo} 
          user={user} 
          onLogout={handleLogout} 
          onBack={handleBack} 
          showBack={history.length > 0} 
          search={search} 
          setSearch={setSearch}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Page Routing */}
      {page === "home" && (
        <HomePage setPage={navigateTo} setSelectedRecipe={setSelectedRecipe} search={search} setSearch={setSearch} />
      )}

      {page === "recipe-detail" && (
        <RecipeDetailPage recipe={selectedRecipe} setPage={navigateTo} onBack={handleBack} />
      )}

      {page === "explore-recipes" && (
        <ExploreRecipesPage setPage={navigateTo} setSelectedRecipe={setSelectedRecipe} />
      )}

      {page.includes("-dashboard") && renderDashboard()}

      {/* Auth Overlays */}
      {page === "login" && <LoginPage setPage={navigateTo} setUser={setUser} onBack={handleBack} />}
      {page === "signup" && <RegisterPage setPage={navigateTo} onBack={handleBack} />}
      {page === "forgot-password" && <ForgotPasswordPage setPage={navigateTo} onBack={handleBack} />}
      {page === "auth-callback" && <AuthCallbackPage setPage={navigateTo} setUser={setUser} />}
    </>
  );
}
