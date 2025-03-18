import React, { useEffect, useState } from "react";
import { useTimer } from "react-timer-hook";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface ContestTimerProps {
    expiryTimestamp: Date;
    endTimestamp: Date;
}

const ContestTimer: React.FC<ContestTimerProps> = ({ expiryTimestamp, endTimestamp }) => {
    const { seconds, minutes, hours, days } = useTimer({
        expiryTimestamp,
        onExpire: () => {},
    });

    const [status, setStatus] = useState<"upcoming" | "ongoing" | "ended">("upcoming");

    useEffect(() => {
        const updateStatus = () => {
            const now = Date.now();
            if (now < expiryTimestamp.getTime()) {
                setStatus("upcoming");
            } else if (now >= expiryTimestamp.getTime() && now < endTimestamp.getTime()) {
                setStatus("ongoing");
            } else {
                setStatus("ended");
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 1000);

        return () => clearInterval(interval);
    }, [expiryTimestamp, endTimestamp]);

    return (
        <div className={`contest-status-timer status-${status}`}>
            {status === "upcoming" && (
                <>
                    <div className="timer-icon">
                        <Clock size={18} />
                    </div>
                    <div className="timer-content">
                        <div className="timer-label">Starts in</div>
                        <div className="timer-countdown">
                            {days > 0 && <span className="time-unit">{days}d</span>}
                            {hours > 0 && <span className="time-unit">{hours}h</span>}
                            <span className="time-unit">{minutes}m</span>
                            <span className="time-unit">{seconds}s</span>
                        </div>
                    </div>
                </>
            )}

            {status === "ongoing" && (
                <>
                    <div className="timer-icon pulse">
                        <CheckCircle size={18} />
                    </div>
                    <div className="timer-content">
                        <div className="timer-label">Ongoing</div>
                        <div className="timer-subtitle">Contest is live now</div>
                    </div>
                </>
            )}

            {status === "ended" && (
                <>
                    <div className="timer-icon">
                        <AlertTriangle size={18} />
                    </div>
                    <div className="timer-content">
                        <div className="timer-label">Ended</div>
                        <div className="timer-subtitle">Contest has finished</div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContestTimer;
