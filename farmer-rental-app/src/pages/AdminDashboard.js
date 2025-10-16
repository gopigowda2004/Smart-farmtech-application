import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import NotificationSystem from "../components/NotificationSystem";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddEquipmentForm, setShowAddEquipmentForm] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({
    name: "",
    description: "",
    price: "",
    image: ""
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [editEquipmentForm, setEditEquipmentForm] = useState({});

  // Check if user is admin
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    
    if (userRole !== "ADMIN" || !isAdmin) {
      alert("❌ Access Denied: Admin privileges required");
      navigate("/login");
      return;
    }
    
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load users, equipment, and bookings data
      const [usersRes, equipmentRes, bookingsRes] = await Promise.all([
        api.get("/users"),
        api.get("/equipments"),
        api.get("/bookings")
      ]);
      
      setUsers(usersRes.data || []);
      setEquipment(equipmentRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
        alert("✅ User deleted successfully");
      } catch (error) {
        alert("❌ Error deleting user: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const deleteEquipment = async (equipmentId) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        const userId = localStorage.getItem("userId");
        const farmerId = localStorage.getItem("farmerId") || "1"; // Admin farmer ID
        await api.delete(`/equipments/${equipmentId}?farmerId=${farmerId}&userId=${userId}`);
        setEquipment(equipment.filter(eq => eq.id !== equipmentId));
        alert("✅ Equipment deleted successfully");
      } catch (error) {
        alert("❌ Error deleting equipment: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user.id);
    setEditUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      district: user.district || "",
      state: user.state || "",
      farmSize: user.farmSize || ""
    });
  };

  const cancelEditUser = () => {
    setEditingUser(null);
    setEditUserForm({});
  };

  const saveEditUser = async (userId) => {
    try {
      await api.put(`/users/${userId}`, editUserForm);
      // Refresh users list
      const usersRes = await api.get("/users");
      setUsers(usersRes.data || []);
      setEditingUser(null);
      setEditUserForm({});
      alert("✅ User updated successfully");
    } catch (error) {
      alert("❌ Error updating user: " + (error.response?.data?.message || error.message));
    }
  };

  const startEditEquipment = (eq) => {
    setEditingEquipment(eq.id);
    setEditEquipmentForm({
      name: eq.name,
      description: eq.description || "",
      price: eq.pricePerHour || (eq.price ? eq.price / 24 : 0),
      image: eq.image || ""
    });
  };

  const cancelEditEquipment = () => {
    setEditingEquipment(null);
    setEditEquipmentForm({});
  };

  const saveEditEquipment = async (equipmentId) => {
    try {
      const userId = localStorage.getItem("userId");
      const farmerId = localStorage.getItem("farmerId") || "1"; // Admin farmer ID
      const pricePerHour = parseFloat(editEquipmentForm.price);
      const updateData = {
        name: editEquipmentForm.name,
        description: editEquipmentForm.description,
        price: pricePerHour * 24, // Calculate daily rate from hourly
        pricePerHour: pricePerHour,
        image: editEquipmentForm.image
      };
      
      await api.put(`/equipments/${equipmentId}?userId=${userId}&farmerId=${farmerId}`, updateData);
      // Refresh equipment list
      const equipmentRes = await api.get("/equipments");
      setEquipment(equipmentRes.data || []);
      setEditingEquipment(null);
      setEditEquipmentForm({});
      alert("✅ Equipment updated successfully");
    } catch (error) {
      alert("❌ Error updating equipment: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const farmerId = localStorage.getItem("farmerId") || "1"; // Default admin farmer ID
      
      const pricePerHour = parseFloat(equipmentForm.price);
      const equipmentData = {
        name: equipmentForm.name,
        description: equipmentForm.description,
        price: pricePerHour * 24, // Calculate daily rate from hourly
        pricePerHour: pricePerHour,
        image: equipmentForm.image
      };
      
      const response = await api.post(`/equipments/add/${farmerId}?userId=${userId}`, equipmentData);
      
      // Refresh equipment list from server to get complete data
      const equipmentRes = await api.get("/equipments");
      setEquipment(equipmentRes.data || []);
      
      // Reset form and hide it
      setEquipmentForm({ name: "", description: "", price: "", image: "" });
      setShowAddEquipmentForm(false);
      
      alert("✅ Equipment added successfully!");
    } catch (error) {
      console.error("Error adding equipment:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      alert("❌ Error adding equipment: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
    }
  };

  const handleEquipmentFormChange = (e) => {
    setEquipmentForm({
      ...equipmentForm,
      [e.target.name]: e.target.value
    });
  };

  const viewBookingDetails = (booking) => {
    alert(`Booking Details:
ID: ${booking.id}
Equipment: ${booking.equipment?.name || "N/A"}
Renter: ${booking.renter?.name || "N/A"} (${booking.renter?.phone || "N/A"})
Owner: ${booking.owner?.name || booking.acceptedOwner?.name || "N/A"}
Start Date: ${booking.startDate}
Hours: ${booking.hours || "N/A"}
Status: ${booking.status}
Total Cost: ₹${booking.totalCost || "0"}
Location: ${booking.location || "N/A"}
Created: ${booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "N/A"}`);
  };

  const cancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await api.patch(`/bookings/${bookingId}/status`, null, {
          params: { status: "CANCELLED" }
        });
        
        // Update local state
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: "CANCELLED" }
            : booking
        ));
        
        alert("✅ Booking cancelled successfully");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("❌ Error cancelling booking: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const renderOverview = () => (
    <div style={styles.overviewGrid}>
      <div style={styles.statCard}>
        <h3>👥 Total Users</h3>
        <div style={styles.statNumber}>{users.length}</div>
        <div style={styles.statBreakdown}>
          <div>Admins: {users.filter(u => u.role === "ADMIN").length}</div>
          <div>Owners: {users.filter(u => u.role === "OWNER").length}</div>
          <div>Renters: {users.filter(u => u.role === "RENTER").length}</div>
        </div>
      </div>
      
      <div style={styles.statCard}>
        <h3>🚜 Total Equipment</h3>
        <div style={styles.statNumber}>{equipment.length}</div>
        <div style={styles.statBreakdown}>
          <div>Available: {equipment.filter(e => e.status === "available").length}</div>
          <div>Rented: {equipment.filter(e => e.status === "rented").length}</div>
        </div>
      </div>
      
      <div style={styles.statCard}>
        <h3>📋 Total Bookings</h3>
        <div style={styles.statNumber}>{bookings.length}</div>
        <div style={styles.statBreakdown}>
          <div>Pending: {bookings.filter(b => b.status?.toUpperCase() === "PENDING").length}</div>
          <div>Confirmed: {bookings.filter(b => b.status?.toUpperCase() === "CONFIRMED").length}</div>
          <div>Completed: {bookings.filter(b => b.status?.toUpperCase() === "COMPLETED").length}</div>
          <div>Cancelled: {bookings.filter(b => b.status?.toUpperCase() === "CANCELLED").length}</div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div style={styles.tableContainer}>
      <div style={styles.tableHeader}>
        <h3>👥 User Management</h3>
        <button 
          style={styles.addButton}
          onClick={() => navigate("/admin/add-user")}
        >
          + Add New User
        </button>
      </div>
      
      <div style={styles.table}>
        <div style={{...styles.tableRow, gridTemplateColumns: "60px 1fr 1fr 120px 100px 1fr 100px 150px"}}>
          <div style={styles.tableHeaderCell}>ID</div>
          <div style={styles.tableHeaderCell}>Name</div>
          <div style={styles.tableHeaderCell}>Email</div>
          <div style={styles.tableHeaderCell}>Phone</div>
          <div style={styles.tableHeaderCell}>Role</div>
          <div style={styles.tableHeaderCell}>Location</div>
          <div style={styles.tableHeaderCell}>Farm Size</div>
          <div style={styles.tableHeaderCell}>Actions</div>
        </div>
        
        {users.map(user => (
          editingUser === user.id && user.role !== "ADMIN" ? (
            // Edit Mode (only for non-ADMIN users)
            <div key={user.id} style={{...styles.tableRow, gridTemplateColumns: "60px 1fr 1fr 120px 100px 1fr 100px 150px", backgroundColor: "#f0f8ff"}}>
              <div style={styles.tableCell}>#{user.id}</div>
              <div style={styles.tableCell}>
                <input 
                  type="text" 
                  value={editUserForm.name} 
                  onChange={(e) => setEditUserForm({...editUserForm, name: e.target.value})}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.tableCell}>
                <input 
                  type="email" 
                  value={editUserForm.email} 
                  onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.tableCell}>
                <input 
                  type="text" 
                  value={editUserForm.phone} 
                  onChange={(e) => setEditUserForm({...editUserForm, phone: e.target.value})}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.tableCell}>
                <select 
                  value={editUserForm.role} 
                  onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                  style={styles.editInput}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="OWNER">OWNER</option>
                  <option value="RENTER">RENTER</option>
                </select>
              </div>
              <div style={styles.tableCell}>
                <input 
                  type="text" 
                  placeholder="District" 
                  value={editUserForm.district} 
                  onChange={(e) => setEditUserForm({...editUserForm, district: e.target.value})}
                  style={{...styles.editInput, marginBottom: "4px"}}
                />
                <input 
                  type="text" 
                  placeholder="State" 
                  value={editUserForm.state} 
                  onChange={(e) => setEditUserForm({...editUserForm, state: e.target.value})}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.tableCell}>
                <input 
                  type="text" 
                  value={editUserForm.farmSize} 
                  onChange={(e) => setEditUserForm({...editUserForm, farmSize: e.target.value})}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.tableCell}>
                <button 
                  style={styles.saveButton}
                  onClick={() => saveEditUser(user.id)}
                >
                  Save
                </button>
                <button 
                  style={styles.cancelButton}
                  onClick={cancelEditUser}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div key={user.id} style={{...styles.tableRow, gridTemplateColumns: "60px 1fr 1fr 120px 100px 1fr 100px 150px"}}>
              <div style={styles.tableCell}>#{user.id}</div>
              <div style={styles.tableCell}>{user.name}</div>
              <div style={styles.tableCell}>{user.email}</div>
              <div style={styles.tableCell}>{user.phone}</div>
              <div style={styles.tableCell}>
                <span style={{
                  ...styles.roleBadge,
                  backgroundColor: user.role === "ADMIN" ? "#ff6b6b" : 
                                  user.role === "OWNER" ? "#4ecdc4" : "#45b7d1"
                }}>
                  {user.role}
                </span>
              </div>
              <div style={styles.tableCell}>
                <div>{user.district || "N/A"}</div>
                <div style={styles.subText}>{user.state || ""}</div>
              </div>
              <div style={styles.tableCell}>{user.farmSize || "N/A"}</div>
              <div style={styles.tableCell}>
                {user.role !== "ADMIN" ? (
                  <>
                    <button 
                      style={styles.editButton}
                      onClick={() => startEditUser(user)}
                    >
                      Edit
                    </button>
                    <button 
                      style={styles.deleteButton}
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <span style={{color: "#95a5a6", fontSize: "12px"}}>Protected</span>
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );

  const renderEquipmentManagement = () => (
    <div style={styles.tableContainer}>
      <div style={styles.tableHeader}>
        <h3>🚜 Equipment Management</h3>
        <button 
          style={styles.addButton}
          onClick={() => setShowAddEquipmentForm(true)}
        >
          + Add New Equipment
        </button>
      </div>
      
      <div style={styles.table}>
        <div style={styles.tableRow}>
          <div style={styles.tableHeaderCell}>Name</div>
          <div style={styles.tableHeaderCell}>Type</div>
          <div style={styles.tableHeaderCell}>Owner</div>
          <div style={styles.tableHeaderCell}>Price/Hour</div>
          <div style={styles.tableHeaderCell}>Status</div>
          <div style={styles.tableHeaderCell}>Actions</div>
        </div>
        
        {equipment.map(eq => (
          editingEquipment === eq.id ? (
            // Edit Mode
            <div key={eq.id} style={{...styles.tableRow, backgroundColor: "#f0f8ff"}}>
              <div style={styles.tableCell}>
                <input 
                  type="text" 
                  value={editEquipmentForm.name} 
                  onChange={(e) => setEditEquipmentForm({...editEquipmentForm, name: e.target.value})}
                  style={styles.editInput}
                  placeholder="Equipment Name"
                />
              </div>
              <div style={styles.tableCell}>
                <input 
                  type="text" 
                  value={editEquipmentForm.description} 
                  onChange={(e) => setEditEquipmentForm({...editEquipmentForm, description: e.target.value})}
                  style={styles.editInput}
                  placeholder="Type/Description"
                />
              </div>
              <div style={styles.tableCell}>{eq.ownerName}</div>
              <div style={styles.tableCell}>
                <input 
                  type="number" 
                  value={editEquipmentForm.price} 
                  onChange={(e) => setEditEquipmentForm({...editEquipmentForm, price: e.target.value})}
                  style={styles.editInput}
                  placeholder="Price per hour"
                />
              </div>
              <div style={styles.tableCell}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: eq.status === "available" ? "#4ecdc4" : "#ff6b6b"
                }}>
                  {eq.status}
                </span>
              </div>
              <div style={styles.tableCell}>
                <button 
                  style={styles.saveButton}
                  onClick={() => saveEditEquipment(eq.id)}
                >
                  Save
                </button>
                <button 
                  style={styles.cancelButton}
                  onClick={cancelEditEquipment}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div key={eq.id} style={styles.tableRow}>
              <div style={styles.tableCell}>{eq.name}</div>
              <div style={styles.tableCell}>{eq.type}</div>
              <div style={styles.tableCell}>{eq.ownerName}</div>
              <div style={styles.tableCell}>₹{eq.pricePerHour || (eq.price ? (eq.price / 24).toFixed(2) : 0)}/hr</div>
              <div style={styles.tableCell}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: eq.status === "available" ? "#4ecdc4" : "#ff6b6b"
                }}>
                  {eq.status}
                </span>
              </div>
              <div style={styles.tableCell}>
                <button 
                  style={styles.editButton}
                  onClick={() => startEditEquipment(eq)}
                >
                  Edit
                </button>
                <button 
                  style={styles.deleteButton}
                  onClick={() => deleteEquipment(eq.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );

  const renderBookingManagement = () => (
    <div style={styles.tableContainer}>
      <div style={styles.tableHeader}>
        <h3>📋 Booking Management</h3>
        <div style={styles.bookingStats}>
          <span style={styles.statBadge}>
            Pending: {bookings.filter(b => b.status === "PENDING").length}
          </span>
          <span style={styles.statBadge}>
            Confirmed: {bookings.filter(b => b.status === "CONFIRMED").length}
          </span>
          <span style={styles.statBadge}>
            Completed: {bookings.filter(b => b.status === "COMPLETED").length}
          </span>
        </div>
      </div>
      
      <div style={styles.table}>
        <div style={{...styles.tableRow, gridTemplateColumns: "80px 1fr 1fr 1fr 100px 80px 100px 100px 150px"}}>
          <div style={styles.tableHeaderCell}>Booking ID</div>
          <div style={styles.tableHeaderCell}>Equipment</div>
          <div style={styles.tableHeaderCell}>Renter</div>
          <div style={styles.tableHeaderCell}>Accepted By</div>
          <div style={styles.tableHeaderCell}>Start Date</div>
          <div style={styles.tableHeaderCell}>Hours</div>
          <div style={styles.tableHeaderCell}>Status</div>
          <div style={styles.tableHeaderCell}>Total Cost</div>
          <div style={styles.tableHeaderCell}>Actions</div>
        </div>
        
        {bookings.map(booking => (
          <div key={booking.id} style={{...styles.tableRow, gridTemplateColumns: "80px 1fr 1fr 1fr 100px 80px 100px 100px 150px"}}>
            <div style={styles.tableCell}>#{booking.id}</div>
            <div style={styles.tableCell}>{booking.equipment?.name || "N/A"}</div>
            <div style={styles.tableCell}>
              <div>{booking.renter?.name || "N/A"}</div>
              <div style={styles.subText}>{booking.renter?.phone || ""}</div>
            </div>
            <div style={styles.tableCell}>
              <div>{booking.acceptedOwner?.name || "Not Accepted"}</div>
              <div style={styles.subText}>{booking.acceptedOwner?.phone || ""}</div>
            </div>
            <div style={styles.tableCell}>{booking.startDate}</div>
            <div style={styles.tableCell}>{booking.hours || "N/A"}</div>
            <div style={styles.tableCell}>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: 
                  booking.status === "PENDING" ? "#f39c12" :
                  booking.status === "CONFIRMED" ? "#27ae60" :
                  booking.status === "COMPLETED" ? "#3498db" :
                  booking.status === "CANCELLED" ? "#e74c3c" : "#95a5a6"
              }}>
                {booking.status}
              </span>
            </div>
            <div style={styles.tableCell}>₹{booking.totalCost || "0"}</div>
            <div style={styles.tableCell}>
              <button 
                style={styles.viewButton}
                onClick={() => viewBookingDetails(booking)}
              >
                View
              </button>
              {booking.status === "PENDING" && (
                <button 
                  style={styles.cancelButton}
                  onClick={() => cancelBooking(booking.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🔧 Admin Dashboard</h1>
        <div style={styles.headerActions}>
          <NotificationSystem />
          <span style={styles.welcomeText}>Welcome, Administrator</span>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{...styles.tab, ...(activeTab === "overview" ? styles.activeTab : {})}}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === "users" ? styles.activeTab : {})}}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === "equipment" ? styles.activeTab : {})}}
          onClick={() => setActiveTab("equipment")}
        >
          🚜 Equipment
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === "bookings" ? styles.activeTab : {})}}
          onClick={() => setActiveTab("bookings")}
        >
          📋 Bookings
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "users" && renderUserManagement()}
            {activeTab === "equipment" && renderEquipmentManagement()}
            {activeTab === "bookings" && renderBookingManagement()}
          </>
        )}
      </div>

      {/* Add Equipment Modal */}
      {showAddEquipmentForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Add New Equipment</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowAddEquipmentForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddEquipment} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Equipment Name *</label>
                <input
                  type="text"
                  name="name"
                  value={equipmentForm.name}
                  onChange={handleEquipmentFormChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  name="description"
                  value={equipmentForm.description}
                  onChange={handleEquipmentFormChange}
                  style={{...styles.input, height: "80px"}}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Hourly Rate (₹/hour) *</label>
                <input
                  type="number"
                  name="price"
                  value={equipmentForm.price}
                  onChange={handleEquipmentFormChange}
                  style={styles.input}
                  min="0"
                  step="0.01"
                  required
                  placeholder="Enter price per hour"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={equipmentForm.image}
                  onChange={handleEquipmentFormChange}
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelButton}
                  onClick={() => setShowAddEquipmentForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitButton}
                >
                  Add Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2c3e50",
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "24px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  welcomeText: {
    fontSize: "14px",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  tabContainer: {
    backgroundColor: "white",
    display: "flex",
    borderBottom: "1px solid #ddd",
  },
  tab: {
    padding: "15px 25px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    borderBottom: "3px solid transparent",
  },
  activeTab: {
    borderBottom: "3px solid #3498db",
    color: "#3498db",
    fontWeight: "bold",
  },
  content: {
    padding: "20px",
  },
  loading: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#3498db",
    margin: "10px 0",
  },
  statBreakdown: {
    fontSize: "14px",
    color: "#666",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "20px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  bookingStats: {
    display: "flex",
    gap: "10px",
  },
  statBadge: {
    padding: "6px 12px",
    borderRadius: "12px",
    backgroundColor: "#3498db",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 150px",
    padding: "15px 20px",
    borderBottom: "1px solid #eee",
    alignItems: "center",
  },
  tableHeaderCell: {
    fontWeight: "bold",
    color: "#333",
  },
  tableCell: {
    color: "#666",
  },
  subText: {
    fontSize: "12px",
    color: "#999",
    marginTop: "4px",
  },
  roleBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "12px",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  saveButton: {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "12px",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  editInput: {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
    boxSizing: "border-box",
  },
  comingSoon: {
    textAlign: "center",
    padding: "50px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "0",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #eee",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
  },
  form: {
    padding: "20px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  submitButton: {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  bookingStats: {
    display: "flex",
    gap: "10px",
  },
  statBadge: {
    padding: "6px 12px",
    backgroundColor: "#3498db",
    color: "white",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  subText: {
    fontSize: "11px",
    color: "#999",
    marginTop: "2px",
  },
  viewButton: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "12px",
  },
};

export default AdminDashboard;