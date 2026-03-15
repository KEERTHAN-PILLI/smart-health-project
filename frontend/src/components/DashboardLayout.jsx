import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import "../styles/app.css";
import "../styles/dashboard.css";

export default function DashboardLayout() {
    return (
        <div className="app-container">
            <div className="main-layout user-bg">
                <BottomNav />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
