import { LayoutDashboard, Users, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function TrainerNav() {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="bottom-nav">
            <Link
                to="/trainer-dashboard"
                className={`nav-item ${currentPath === '/trainer-dashboard' ? 'active' : ''}`}
            >
                <div className="nav-icon">
                    <LayoutDashboard />
                </div>
                <span>Overview</span>
            </Link>

            <Link
                to="/trainer/clients"
                className={`nav-item ${currentPath.includes('/trainer/client') ? 'active' : ''}`}
            >
                <div className="nav-icon">
                    <Users />
                </div>
                <span>Clients</span>
            </Link>

            <Link
                to="/trainer/profile"
                className={`nav-item ${currentPath === '/trainer/profile' ? 'active' : ''}`}
            >
                <div className="nav-icon">
                    <User />
                </div>
                <span>Profile</span>
            </Link>
        </div>
    );
}
