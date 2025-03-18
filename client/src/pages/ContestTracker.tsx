import React from "react";
import "../components/contestTracker/ContestDashboard.css";
import ContestDashboard from "../components/contestTracker/ContestDashboard";

const ContestTracker: React.FC = () => {
    return (
        <div className="dark:bg-gray-950 bg-gray-200">
            <ContestDashboard />
        </div>
    );
};

export default ContestTracker;
