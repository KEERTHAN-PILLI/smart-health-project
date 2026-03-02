import { Outlet } from "react-router-dom";
import TrainerNav from "./TrainerNav";
import "../styles/app.css";
import "../styles/dashboard.css";

export default function TrainerLayout() {
    return (
        <div className="app-container">
            <div className="main-layout">
                <TrainerNav />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
