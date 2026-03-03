import { LayoutDashboard, Activity, Apple, User, Users, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="bottom-nav">
            <Link
                to="/user-dashboard"
                className={`nav-item ${currentPath === '/user-dashboard' ? 'active' : ''}`}
            >
                <div className="nav-icon">
                    <LayoutDashboard />
                </div>
                <span>Dashboard</span>
            </Link>

            <Link
                to="/workouts"
                className={`nav-item ${currentPath === '/workouts' ? 'active' : ''}`}
            >
                <div className="nav-icon">
                    <Activity />
                </div>
                <span>Activity</span>
            </Link>

            <Link
                to="/bmi"
                className={`nav-item ${currentPath === '/bmi' ? 'active' : ''}`}
            >
                <div className="nav-icon">
                    <Activity />
                </div>
                <span>BMI Calc</span>
            </Link>

            <Link
                to="/nutrition"
                className={`nav-item ${currentPath === '/nutrition' ? 'active' : ''}`}
            >
                <div className="nav-icon">
                    <Apple />
                </div>
                <span>Nutrition</span>
            </Link>

            <Link
                to="/find-trainers"
                className={`nav-item ${currentPath === '/find-trainers' ? 'active' : ''}`}
            >
                <div className="nav-icon">
                    <Users />
                </div>
                <span>Trainers</span>
            </Link>

            <Link
                to="/profile"
                className={`nav-item ${currentPath === '/profile' ? 'active' : ''}`}
            >
                <div className="nav-icon">
                    <User />
                </div>
                <span>Profile</span>
            </Link>
        </div>
    );
}