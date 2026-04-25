import { useState, useEffect } from "react";
import { recipeAPI } from "../services/api";

export default function CreateRecipeModal({ isOpen, onClose, onRefresh, editRecipe = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    servings: 1,
    difficulty: "Easy",
    cuisine: "",
    tag: "",
    tip: "",
  });
  
  const UNITS = ["pcs", "cup", "tbsp", "tsp", "g", "kg", "ml", "l", "oz", "lb", "pinch", "to taste"];
  
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "", unit: "", note: "" }]);
  const [steps, setSteps] = useState([{ title: "", body: "", order: 1, hasImage: false, image: null, preview: null }]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Sync props to state when modal opens or editRecipe changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: editRecipe?.title || "",
        description: editRecipe?.description || "",
        prepTime: editRecipe?.prepTime || "",
        cookTime: editRecipe?.cookTime || "",
        servings: editRecipe?.servings || 1,
        difficulty: editRecipe?.difficulty || "Easy",
        cuisine: editRecipe?.cuisine || "",
        tag: editRecipe?.tag || "",
        tip: editRecipe?.tip || "",
      });
      setIngredients(editRecipe?.ingredients?.length > 0 ? [...editRecipe.ingredients] : [{ name: "", quantity: "", unit: "", note: "" }]);
      setSteps(editRecipe?.steps?.length > 0 ? editRecipe.steps.map(s => ({ ...s, preview: s.image ? s.image : null })) : [{ title: "", body: "", order: 1, hasImage: false, image: null, preview: null }]);
      setImagePreview(editRecipe?.image || null);
      setImage(null);
      setError(null);
    }
  }, [isOpen, editRecipe]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, { name: "", quantity: "", unit: "", note: "" }]);
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => setSteps([...steps, { title: "", body: "", order: steps.length + 1, hasImage: false, image: null, preview: null }]);
  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
    setSteps(newSteps);
  };
  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleStepImageChange = (index, file) => {
    if (file) {
      const newSteps = [...steps];
      newSteps[index].image = file;
      newSteps[index].hasImage = true;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedSteps = [...steps];
        updatedSteps[index].preview = reader.result;
        setSteps(updatedSteps);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeStepImage = (index) => {
    const newSteps = [...steps];
    newSteps[index].image = null;
    newSteps[index].preview = null;
    newSteps[index].hasImage = false;
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append("ingredients", JSON.stringify(ingredients));
      
      // Map steps to remove internal state like preview and File objects before stringifying
      const stepsToUpload = steps.map(s => ({
        title: s.title,
        body: s.body,
        order: s.order,
        hasImage: s.hasImage
      }));
      data.append("steps", JSON.stringify(stepsToUpload));
      
      if (image) data.append("image", image);
      
      // Append step images in correct order
      steps.forEach(s => {
        if (s.image) {
          data.append("stepImages", s.image);
        }
      });
      
      // Default status to Pending Review for admin approval
      if (!editRecipe) {
        data.append("status", "Pending Review");
      } else {
        data.append("status", editRecipe.status); // Keep current status
      }

      const response = editRecipe 
        ? await recipeAPI.update(editRecipe._id, data)
        : await recipeAPI.create(data);
        
      if (response.data.success) {
        const result = response.data.data;

        // Notify other pages that a recipe changed
        if (editRecipe) {
          window.dispatchEvent(new CustomEvent("recipe-updated", { detail: result }));
        } else {
          window.dispatchEvent(new CustomEvent("recipe-created", { detail: result }));
        }

        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Error creating recipe:", err);
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        setError(backendErrors.join(", "));
      } else {
        setError(err.response?.data?.message || "Failed to create recipe. Please check all fields.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      backdropFilter: "blur(4px)",
      padding: "20px"
    }}>
      <div className="modal-content" style={{
        background: "var(--white)",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "800px",
        maxHeight: "99vh",
        overflowY: "auto",
        position: "relative",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 32px",
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "var(--white)",
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--navy)" }}>{editRecipe ? "Edit Recipe" : "Create New Recipe"}</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>{editRecipe ? "Update your culinary masterpiece." : "Share your culinary masterpiece with the world."}</p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: "var(--bg)", 
              border: "none", 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              cursor: "pointer",
              fontSize: "20px",
              color: "var(--text-muted)"
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          {error && (
            <div style={{ 
              padding: "16px", 
              background: "rgba(239, 68, 68, 0.1)", 
              color: "#ef4444", 
              borderRadius: "12px", 
              marginBottom: "24px", 
              fontSize: "14px",
              fontWeight: "600",
              border: "1px solid rgba(239, 68, 68, 0.2)"
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            {/* Left Column: Basic Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-group">
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>Recipe Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="e.g. Classic Margherita Pizza"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--bg)", outline: "none", fontSize: "15px" }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>Description</label>
                <textarea 
                  name="description" 
                  required 
                  rows="3"
                  placeholder="Tell us the story behind this dish..."
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--bg)", outline: "none", fontSize: "15px", resize: "none" }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>Chef's Tip (Optional)</label>
                <input 
                  type="text" 
                  name="tip" 
                  placeholder="e.g. Let the dough rest for 24 hours..."
                  value={formData.tip}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--bg)", outline: "none", fontSize: "15px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>Prep Time</label>
                  <input type="text" name="prepTime" placeholder="15 min" value={formData.prepTime} onChange={handleInputChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--bg)" }} />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>Cook Time</label>
                  <input type="text" name="cookTime" placeholder="30 min" value={formData.cookTime} onChange={handleInputChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--bg)" }} />
                </div>
              </div>
            </div>

            {/* Right Column: Image & Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-group">
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>Cover Image</label>
                <div 
                  onClick={() => document.getElementById("recipe-image").click()}
                  style={{ 
                    width: "100%", 
                    height: "180px", 
                    borderRadius: "16px", 
                    border: "2px dashed var(--border-light)", 
                    background: imagePreview ? `url(${imagePreview}) center/cover` : "var(--bg)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s"
                  }}
                >
                  {!imagePreview && (
                    <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                      <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>📸</span>
                      <span style={{ fontSize: "13px" }}>Upload Cover</span>
                    </div>
                  )}
                  <input id="recipe-image" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                </div>
              </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>Difficulty</label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--bg)" }}>
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>Servings</label>
                    <input type="number" name="servings" min="1" value={formData.servings} onChange={handleInputChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--bg)" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>Cuisine</label>
                    <input type="text" name="cuisine" placeholder="e.g. Italian" value={formData.cuisine} onChange={handleInputChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--bg)" }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>Category (Tag)</label>
                    <input type="text" name="tag" placeholder="e.g. Pasta" value={formData.tag} onChange={handleInputChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--bg)" }} />
                  </div>
                </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "32px 0" }} />

          {/* Ingredients */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Ingredients</h3>
              <button type="button" onClick={addIngredient} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "600", cursor: "pointer" }}>+ Add Item</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {ingredients.map((ing, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input 
                    placeholder="Name" 
                    value={ing.name} 
                    onChange={(e) => updateIngredient(idx, "name", e.target.value)} 
                    style={{ flex: 2, padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-light)", background: "var(--bg)" }} 
                  />
                  <input 
                    placeholder="Qty" 
                    value={ing.quantity} 
                    onChange={(e) => updateIngredient(idx, "quantity", e.target.value)} 
                    style={{ width: "70px", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-light)", background: "var(--bg)" }} 
                  />
                  <select 
                    value={ing.unit} 
                    onChange={(e) => updateIngredient(idx, "unit", e.target.value)} 
                    style={{ width: "100px", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-light)", background: "var(--bg)" }}
                  >
                    <option value="">Unit</option>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <input 
                    placeholder="Note" 
                    value={ing.note} 
                    onChange={(e) => updateIngredient(idx, "note", e.target.value)} 
                    style={{ flex: 1.5, padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-light)", background: "var(--bg)" }} 
                  />
                  <button type="button" onClick={() => removeIngredient(idx)} style={{ color: "#ef4444", background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Cooking Steps</h3>
              <button type="button" onClick={addStep} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "600", cursor: "pointer" }}>+ Add Step</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ padding: "16px", background: "var(--bg)", borderRadius: "16px", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>Step {step.order}</span>
                    <button type="button" onClick={() => removeStep(idx)} style={{ color: "var(--text-muted)", background: "none", border: "none" }}>Remove</button>
                  </div>
                  <input placeholder="Title" value={step.title} onChange={(e) => updateStep(idx, "title", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-light)", marginBottom: "8px" }} />
                  <textarea placeholder="Description..." value={step.body} onChange={(e) => updateStep(idx, "body", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-light)", resize: "none", marginBottom: "12px" }} />
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {step.preview ? (
                      <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden" }}>
                        <img src={step.preview} alt={`Step ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button 
                          type="button" 
                          onClick={() => removeStepImage(idx)}
                          style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "4px", width: "18px", height: "18px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => document.getElementById(`step-img-${idx}`).click()}
                        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px dashed var(--border-light)", background: "#fff", fontSize: "12px", color: "var(--text-muted)", cursor: "pointer" }}
                      >
                        📷 Add Step Photo
                      </button>
                    )}
                    <input 
                      id={`step-img-${idx}`} 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleStepImageChange(idx, e.target.files[0])} 
                      style={{ display: "none" }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", padding: "16px 0" }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: "12px 32px" }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px 48px", minWidth: "160px" }}>
              {loading ? (editRecipe ? "Updating..." : "Publishing...") : (editRecipe ? "Save Changes" : "Create Recipe")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
