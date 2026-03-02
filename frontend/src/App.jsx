import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import Profile from "./pages/Profile";
import BmiCalculator from "./pages/BmiCalculator";
import FindTrainers from "./pages/FindTrainers";
import DashboardLayout from "./components/DashboardLayout";
import TrainerLayout from "./components/TrainerLayout";
import ClientDetails from "./pages/ClientDetails";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>

      {/* ✅ Default page = Login */}
      <Route path="/" element={<Login />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* USER DASHBOARD ROUTES WITH LAYOUT */}
      <Route element={
        <ProtectedRoute allowedRole="USER">
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/bmi" element={<BmiCalculator />} />
        <Route path="/find-trainers" element={<FindTrainers />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* TRAINER DASHBOARD ROUTES WITH LAYOUT */}
      <Route element={
        <ProtectedRoute allowedRole="TRAINER">
          <TrainerLayout />
        </ProtectedRoute>
      }>
        <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        <Route path="/trainer/clients" element={<TrainerDashboard />} /> {/* Same view for now, could split later */}
        <Route path="/trainer/client/:email" element={<ClientDetails />} />
        <Route path="/trainer/profile" element={<Profile />} /> {/* Reusing standard profile for trainer */}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}