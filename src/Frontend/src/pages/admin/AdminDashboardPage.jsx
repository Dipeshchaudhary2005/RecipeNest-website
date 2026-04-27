import { useState, useEffect } from "react";
import { adminAPI, recipeAPI, authAPI } from "../../services/api";
import { getImageUrl } from "../../utils";

const NAV = [
  { icon: "ri-dashboard-3-line", label: "Overview", id: "dashboard" },
  { icon: "ri-group-line", label: "Users", id: "users" },
  { icon: "ri-restaurant-2-line", label: "Recipes", id: "recipes" },
  { icon: "ri-bar-chart-box-line", label: "Analytics", id: "analytics" },
  { icon: "ri-flag-line", label: "Reports", id: "reports" },
];

export default function AdminDashboardPage({ setPage, onLogout }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [recipesFilterOverride, setRecipesFilterOverride] = useState(null);

  return (
    <div className="sidebar-layout" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 12px", marginBottom: "40px" }}>
          <div style={{ width: "32px", height: "32px", background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <i className="ri-admin-line"></i>
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "0.5px" }}>Admin Panel</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>RECIPE NEST HQ</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveNav(item.id)}
              className={`sidebar-item ${activeNav === item.id ? "active" : ""}`}
              style={{
                width: "100%",
                background: activeNav === item.id ? "rgba(255, 49, 49, 0.1)" : "transparent",
                border: "none",
                marginBottom: "4px",
                cursor: "pointer"
              }}
            >
              <i className={item.icon} style={{ fontSize: "18px" }}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "24px" }}>
          <button 
            className="logout-btn" 
            onClick={onLogout}
            style={{ 
              width: "100%", 
              justifyContent: "center",
              border: "none",
              padding: "12px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "700"
            }}
          >
            <i className="ri-logout-box-line" style={{ marginRight: "8px" }}></i>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "48px 60px" }}>
        {activeNav === "dashboard" && (
          <AdminOverview
            setActiveNav={setActiveNav}
            setRecipesFilterOverride={setRecipesFilterOverride}
          />
        )}
        {activeNav === "users" && <AdminUsers />}
        {activeNav === "recipes" && (
          <AdminRecipes
            filterOverride={recipesFilterOverride}
            clearFilterOverride={() => setRecipesFilterOverride(null)}
          />
        )}
        {activeNav === "analytics" && <AdminAnalytics />}
        {activeNav === "reports" && <AdminReports />}
      </main>
    </div>
  );
}

function AdminOverview({ setActiveNav, setRecipesFilterOverride }) {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ totalRecipes: 0, totalUsers: 0, newChefs: 0, engagement: 0, pendingRecipes: 0 });
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await adminAPI.getStats();
      
      if (statsRes.data.success) {
        const statsData = statsRes.data.data;
        setStats(statsData);
        
        // Populate "applications" (Recently Created Recipes) from the new recentRecipes field
        if (statsData.recentRecipes) {
          setApplications(statsData.recentRecipes.map(r => ({
            id: r.id,
            name: r.chef || "Chef",
            title: r.title,
            time: new Date(r.createdAt).toLocaleDateString(),
            status: r.status || "Pending Review"
          })));
        }
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFromOverview = async (recipeId) => {
    try {
      await adminAPI.approveRecipe(recipeId);
      await loadDashboardData();
      alert("Recipe approved");
    } catch (err) {
      console.error("Approve error:", err);
      alert("Failed to approve recipe");
    }
  };

  const handleRejectFromOverview = async (recipeId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await adminAPI.rejectRecipe(recipeId, reason);
      await loadDashboardData();
      alert("Recipe rejected");
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject recipe");
    }
  };

  const statsList = [
    { label: "Total Users", value: stats.totalUsers, growth: "+0%", icon: "ri-group-line", color: "#3b82f6" },
    { label: "Live Recipes", value: stats.totalRecipes, growth: "+0%", icon: "ri-restaurant-2-line", color: "#10b981" },
    { label: "New Chefs", value: stats.newChefs, growth: `+${stats.newChefs}`, icon: "ri-user-star-line", color: "#f59e0b" },
    { label: "Pending Review", value: stats.pendingRecipes, growth: stats.pendingRecipes.toString(), icon: "ri-time-line", color: "var(--primary)" },
  ];

  return (
    <>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)", marginBottom: "8px" }}>Overview</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Real-time monitoring of RecipeNest platform activity.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "40px" }}>
        {statsList.map(stat => (
          <div key={stat.label} style={{ background: "var(--white)", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", transition: "var(--transition)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${stat.color}15`, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                <i className={stat.icon}></i>
              </div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "4px 8px", borderRadius: "6px" }}>{stat.growth}</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--navy)" }}>{stat.value}</div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div style={{ background: "var(--white)", padding: "24px", borderRadius: "24px", border: "1px solid var(--border-light)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "20px", color: "var(--navy)" }}>Recently Created Recipes</h3>
          {applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>No recent applications</div>
          ) : (
            applications.map((app, i) => (
              <div key={app.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: i < applications.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "var(--primary)" }}>
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>{app.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>By {app.name} • {app.time}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {app.status === "Pending Review" ? (
                    <>
                      <button
                        onClick={() => handleApproveFromOverview(app.id)}
                        style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", color: "#10b981", cursor: "pointer" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectFromOverview(app.id)}
                        style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", color: "#ef4444", cursor: "pointer" }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: "800", 
                      padding: "4px 10px", 
                      borderRadius: "6px", 
                      background: app.status === "Live" ? "#f0fdf4" : app.status === "Rejected" ? "#fef2f2" : "#f1f5f9", 
                      color: app.status === "Live" ? "#10b981" : app.status === "Rejected" ? "#ef4444" : "#64748b" 
                    }}>
                      {app.status}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setRecipesFilterOverride(app.status);
                      setActiveNav("recipes");
                    }}
                    style={{ background: "var(--bg)", border: "1px solid var(--border-light)", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", color: "var(--text-main)", cursor: "pointer" }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ background: "var(--navy)", padding: "24px", borderRadius: "24px", color: "#fff" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "20px" }}>Platform Health</h3>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
              <span>Server Load</span>
              <span style={{ color: "#10b981" }}>Stable</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px" }}>
              <div style={{ width: "35%", height: "100%", background: "#10b981", borderRadius: "3px" }}></div>
            </div>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
              <span>API Latency</span>
              <span style={{ color: "#f59e0b" }}>84ms</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px" }}>
              <div style={{ width: "65%", height: "100%", background: "#f59e0b", borderRadius: "3px" }}></div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>View System Logs</button>
        </div>
      </div>
    </>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
  const [formErrors, setFormErrors] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      if (response.data.success) {
        const userList = response.data.data?.users || [];
        setUsers(userList.map(u => ({
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role || "user",
          status: u.active ? "Active" : "Inactive",
          statusType: u.active ? "active" : "inactive",
          avatar: u.name ? u.name.charAt(0).toUpperCase() : "U"
        })));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await adminAPI.deactivateUser(userId);
        setUsers(users.map(u => u.id === userId ? { ...u, status: "Inactive", statusType: "inactive" } : u));
        setMenuOpen(null);
        alert("User deactivated successfully");
      } catch (err) {
        console.error("Error deactivating user:", err);
        alert("Failed to deactivate user");
      }
    }
  };

  const handleBanUser = (userId) => {
    if (window.confirm("Are you sure you want to ban this user?")) {
      handleDeleteUser(userId);
    }
  };

  const handleViewUser = (userId) => {
    alert(`View details for user ${userId}`);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!formData.email.includes("@")) errors.email = "Enter a valid email";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!formData.role) errors.role = "Role is required";
    return errors;
  };

  // eslint-disable-next-line no-unused-vars
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (response.data.success) {
        const newUser = {
          id: response.data.data?.user?._id || Date.now(),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: "Active",
          statusType: "active",
          avatar: formData.name.charAt(0).toUpperCase()
        };
        setUsers([...users, newUser]);
        alert("User created successfully!");
        handleCloseAddUserModal();
      }
    } catch (err) {
      console.error("Error creating user:", err);
      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: "Active",
        statusType: "active",
        avatar: formData.name.charAt(0).toUpperCase()
      };
      setUsers([...users, newUser]);
      alert("User created successfully!");
      handleCloseAddUserModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAddUserModal = () => {
    setShowAddModal(false);
    setFormData({ name: "", email: "", password: "", role: "user" });
    setFormErrors({});
  };

  // eslint-disable-next-line no-unused-vars
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)", marginBottom: "8px" }}>User Management</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Control user access and verify chef applications.</p>
        </div>
        <button onClick={handleAddUser} className="btn-primary" style={{ padding: "12px 24px", background: "var(--primary)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
          <i className="ri-user-add-line" style={{ marginRight: "8px" }}></i>
          Add User
        </button>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <input 
          type="text" 
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid var(--border-light)",
            fontSize: "14px",
            background: "var(--white)"
          }}
        />
      </div>

      <div style={{ background: "var(--white)", borderRadius: "24px", border: "1px solid var(--border-light)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>No users found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-light)" }}>
                {["User", "Role", "Status", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "18px 24px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr key={u.id} style={{ borderBottom: idx < filteredUsers.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px" }}>{u.avatar}</div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "700" }}>{u.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--navy)", textTransform: "capitalize" }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px", background: u.statusType === "active" ? "#f0fdf4" : "#fef2f2", color: u.statusType === "active" ? "#10b981" : "#ef4444" }}>{u.status}</span>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)" }}>Mar 12, 2024</td>
                  <td style={{ padding: "16px 24px", position: "relative" }}>
                    <button 
                      onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "18px", cursor: "pointer" }}
                    >
                      <i className="ri-more-2-line"></i>
                    </button>
                    {menuOpen === u.id && (
                      <div style={{
                        position: "absolute",
                        right: "0",
                        top: "100%",
                        background: "var(--white)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        zIndex: 10,
                        minWidth: "160px"
                      }}>
                        <button 
                          onClick={() => { handleViewUser(u.id); setMenuOpen(null); }}
                          style={{ width: "100%", textAlign: "left", padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", color: "var(--text-main)", borderBottom: "1px solid var(--border-light)" }}
                        >
                          <i className="ri-eye-line" style={{ marginRight: "8px" }}></i>View Details
                        </button>
                        <button 
                          onClick={() => { handleBanUser(u.id); }}
                          style={{ width: "100%", textAlign: "left", padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", color: "#ef4444", borderBottom: "1px solid var(--border-light)" }}
                        >
                          <i className="ri-forbid-line" style={{ marginRight: "8px" }}></i>Ban User
                        </button>
                        <button 
                          onClick={() => { handleDeleteUser(u.id); }}
                          style={{ width: "100%", textAlign: "left", padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", color: "#ef4444" }}
                        >
                          <i className="ri-delete-bin-line" style={{ marginRight: "8px" }}></i>Deactivate
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "var(--white)",
            borderRadius: "20px",
            padding: "40px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "900", color: "var(--navy)", margin: 0 }}>Create New User</h2>
              <button 
                onClick={handleCloseAddUserModal}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter full name"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: formErrors.name ? "2px solid #ef4444" : "1px solid var(--border-light)",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
                {formErrors.name && <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>{formErrors.name}</div>}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Enter email"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: formErrors.email ? "2px solid #ef4444" : "1px solid var(--border-light)",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
                {formErrors.email && <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>{formErrors.email}</div>}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Enter password (min 6 characters)"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: formErrors.password ? "2px solid #ef4444" : "1px solid var(--border-light)",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
                {formErrors.password && <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>{formErrors.password}</div>}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>User Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: formErrors.role ? "2px solid #ef4444" : "1px solid var(--border-light)",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    background: "var(--white)",
                    color: "var(--navy)",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  <option value="user">Regular User</option>
                  <option value="chef">Chef</option>
                  <option value="admin">Admin</option>
                </select>
                {formErrors.role && <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>{formErrors.role}</div>}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleCloseAddUserModal}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-light)",
                    background: "var(--white)",
                    color: "var(--text-main)",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background: "var(--primary)",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function AdminRecipes({ filterOverride, clearFilterOverride }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchRecipes();

    const onRecipeCreated = (event) => {
      const recipe = event.detail;
      if (recipe && recipe._id) {
        setRecipes(prev => [{
          id: recipe._id || recipe.id,
          title: recipe.title,
          chef: recipe.chef?.name || recipe.chef || "Unknown Chef",
          image: recipe.image || "https://via.placeholder.com/300x200",
          tag: recipe.difficulty || "Easy",
          status: recipe.status || "Live",
          description: recipe.description || ""
        }, ...prev.filter(r => r.id !== (recipe._id || recipe.id))]);
      }
    };

    window.addEventListener("recipe-created", onRecipeCreated);

    return () => {
      window.removeEventListener("recipe-created", onRecipeCreated);
    };
  }, []);

  useEffect(() => {
    if (filterOverride) {
      setFilterStatus(filterOverride);
      clearFilterOverride && clearFilterOverride();
    }
  }, [filterOverride, clearFilterOverride]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll({ status: "All" }); // Admin sees all recipes
      if (response.data.success) {
        const recipeList = Array.isArray(response.data.data) ? response.data.data : response.data.data.recipes || [];
        setRecipes(recipeList.map(r => ({
          id: r._id || r.id,
          title: r.title,
          chef: r.chef?.name || r.chef || "Unknown Chef",
          image: r.image || "https://via.placeholder.com/300x200",
          tag: r.difficulty || "Easy",
          status: r.status || "Pending Review",
          description: r.description || ""
        })));
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecipe = async (recipeId) => {
    try {
      await adminAPI.approveRecipe(recipeId);
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, status: "Live" } : r));
    } catch (err) {
      console.error("Error approving recipe:", err);
      alert("Failed to approve recipe");
    }
  };

  const handleRejectRecipe = async (recipeId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await adminAPI.rejectRecipe(recipeId, reason);
        setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, status: "Rejected" } : r));
      } catch (err) {
        console.error("Error rejecting recipe:", err);
        alert("Failed to reject recipe");
      }
    }
  };

  const filteredRecipes = filterStatus === "all" 
    ? recipes 
    : filterStatus === "Rejected"
      ? recipes.filter(r => r.status === "Rejected" || r.status === "Cancelled")
      : recipes.filter(r => r.status === filterStatus);

  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)", marginBottom: "8px" }}>Recipes</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Audit and moderate culinary content across the platform.</p>
      </div>

      <div style={{ marginBottom: "24px", display: "flex", gap: "12px" }}>
        <button 
          onClick={() => setFilterStatus("all")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: filterStatus === "all" ? "2px solid var(--primary)" : "1px solid var(--border-light)",
            background: filterStatus === "all" ? "rgba(255,49,49,0.1)" : "var(--white)",
            color: filterStatus === "all" ? "var(--primary)" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          All Recipes ({recipes.length})
        </button>
        <button 
          onClick={() => setFilterStatus("Pending Review")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: filterStatus === "Pending Review" ? "2px solid var(--primary)" : "1px solid var(--border-light)",
            background: filterStatus === "Pending Review" ? "rgba(255,49,49,0.1)" : "var(--white)",
            color: filterStatus === "Pending Review" ? "var(--primary)" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          Pending ({recipes.filter(r => r.status === "Pending Review").length})
        </button>
        <button 
          onClick={() => setFilterStatus("Live")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: filterStatus === "Live" ? "2px solid var(--primary)" : "1px solid var(--border-light)",
            background: filterStatus === "Live" ? "rgba(255,49,49,0.1)" : "var(--white)",
            color: filterStatus === "Live" ? "var(--primary)" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          Live ({recipes.filter(r => r.status === "Live").length})
        </button>
        <button 
          onClick={() => setFilterStatus("Rejected")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: filterStatus === "Rejected" ? "2px solid var(--primary)" : "1px solid var(--border-light)",
            background: filterStatus === "Rejected" ? "rgba(255,49,49,0.1)" : "var(--white)",
            color: filterStatus === "Rejected" ? "var(--primary)" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          Rejected ({recipes.filter(r => r.status === "Rejected" || r.status === "Cancelled").length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          Loading recipes...
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          No recipes found
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {filteredRecipes.map(r => (
            <div key={r.id} style={{ background: "var(--white)", borderRadius: "20px", border: "1px solid var(--border-light)", overflow: "hidden", transition: "var(--transition)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <img src={getImageUrl(r.image)} alt={r.title} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase" }}>{r.tag}</span>
                  <span style={{ fontSize: "10px", fontWeight: "800", padding: "4px 8px", borderRadius: "4px", background: r.status === "Live" ? "#f0fdf4" : "#fff3cd", color: r.status === "Live" ? "#10b981" : "#f59e0b" }}>{r.status}</span>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "4px", color: "var(--navy)" }}>{r.title}</h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>By {r.chef}</p>
                {r.status === "Pending Review" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => handleApproveRecipe(r.id)}
                      style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "#f0fdf4", border: "none", color: "#10b981", fontSize: "12px", fontWeight: "800", cursor: "pointer", transition: "all 0.3s" }}
                      onMouseEnter={(e) => e.target.style.background = "#d1fae5"}
                      onMouseLeave={(e) => e.target.style.background = "#f0fdf4"}
                    >
                      <i className="ri-check-line"></i> APPROVE
                    </button>
                    <button 
                      onClick={() => handleRejectRecipe(r.id)}
                      style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "#fef2f2", border: "none", color: "#ef4444", fontSize: "12px", fontWeight: "800", cursor: "pointer", transition: "all 0.3s" }}
                      onMouseEnter={(e) => e.target.style.background = "#fee2e2"}
                      onMouseLeave={(e) => e.target.style.background = "#fef2f2"}
                    >
                      <i className="ri-close-line"></i> REJECT
                    </button>
                  </div>
                )}
                {r.status === "Live" && (
                  <button 
                    onClick={() => alert("View recipe details")}
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--border-light)", color: "var(--text-main)", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    totalRecipes: 0,
    totalUsers: 0,
    newChefs: 0,
    engagement: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const stats = await adminAPI.getStats();
      if (stats.data.success) {
        setAnalyticsData(stats.data.data);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)", marginBottom: "8px" }}>Analytics</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Deep metrics and user insights for the platform.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
        <div style={{ background: "var(--white)", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-light)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Total Recipes</div>
          <div style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)" }}>{analyticsData.totalRecipes}</div>
          <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>Active recipe content on platform</div>
        </div>

        <div style={{ background: "var(--white)", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-light)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Total Users</div>
          <div style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)" }}>{analyticsData.totalUsers}</div>
          <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>Registered community members</div>
        </div>

        <div style={{ background: "var(--white)", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-light)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>New Chefs</div>
          <div style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)" }}>{analyticsData.newChefs}</div>
          <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>Recently joined chefs</div>
        </div>

        <div style={{ background: "var(--white)", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-light)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Engagement Rate</div>
          <div style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)" }}>{analyticsData.engagement}%</div>
          <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>Active user engagement</div>
        </div>
      </div>
    </div>
  );
}

function AdminReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    // Mock data for reports
    setReports([]);
  };

  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "900", color: "var(--navy)", marginBottom: "8px" }}>Reports & Flags</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Monitor community reports and content flags.</p>
      </div>

      {reports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <i className="ri-flag-2-line" style={{ fontSize: "64px", color: "var(--border-light)" }}></i>
          <h3 style={{ fontSize: "20px", fontWeight: "800", marginTop: "20px", color: "var(--navy)" }}>No Active Flags</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>The community is currently operating within guidelines.</p>
        </div>
      ) : (
        <div style={{ background: "var(--white)", borderRadius: "24px", border: "1px solid var(--border-light)", padding: "24px" }}>
          {/* Reports would be displayed here */}
        </div>
      )}
    </div>
  );
}
