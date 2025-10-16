import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import RegisterSelection from "./pages/RegisterSelection";
import RegisterBooker from "./pages/RegisterBooker";
import RegisterAccepter from "./pages/RegisterAccepter";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import Dashboard from "./pages/Dashboard";
import RentEquipment from "./pages/RentEquipment"; 
import AddEquipment from "./pages/AddEquipment";
import EquipmentList from "./pages/EquipmentList";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import OwnerRequests from "./pages/OwnerRequests";
import MyBookings from "./pages/MyBookings";
import CropRecommendation from "./pages/CropRecommendation";
import FertilizerPrediction from "./pages/FertilizerPrediction";
import CropYieldEstimation from "./pages/CropYieldEstimation";
import SoilAnalysis from "./pages/SoilAnalysis";
import PlantDiseaseDetection from "./pages/PlantDiseaseDetection";
import ManageMyEquipment from "./pages/ManageMyEquipment";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <Router>
      <Chatbot />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/register" element={<RegisterSelection />} />
        <Route path="/register-old" element={<Register />} />
        <Route path="/register-booker" element={<RegisterBooker />} />
        <Route path="/register-accepter" element={<RegisterAccepter />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> 
        <Route path="/rent-equipment" element={<RentEquipment />} />
        <Route path="/add-equipment" element={<AddEquipment />} />
        <Route path="/manage-my-equipment" element={<ManageMyEquipment />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/owner-requests" element={<OwnerRequests />} />
        <Route path="/equipment-list" element={<EquipmentList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />

        {/* ML Features */}
        <Route path="/ml/crop-recommendation" element={<CropRecommendation />} />
        <Route path="/ml/fertilizer-prediction" element={<FertilizerPrediction />} />
        <Route path="/ml/crop-yield-estimation" element={<CropYieldEstimation />} />
        <Route path="/ml/soil-analysis" element={<SoilAnalysis />} />
        <Route path="/ml/plant-disease" element={<PlantDiseaseDetection />} />
      </Routes>
    </Router>
  );
}

export default App;
