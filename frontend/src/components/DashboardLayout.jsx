import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import "../styles/app.css";
import "../styles/dashboard.css";

export default function DashboardLayout() {
    return (
        <div className="app-container">
            <div className="main-layout">
                <BottomNav />
                <div className="page-content user-bg">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
