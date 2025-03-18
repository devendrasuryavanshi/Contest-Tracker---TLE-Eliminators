import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface EventCountdownProps {
  expiryTimestamp: Date;
  endTimestamp: Date;
}

const EventCountdown: React.FC<EventCountdownProps> = ({ expiryTimestamp, endTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const [status, setStatus] = useState<"upcoming" | "live" | "ended">("upcoming");

  useEffect(() => {
    const calculateStatus = () => {
      const now = new Date().getTime();
      const startTime = expiryTimestamp.getTime();
      const endTime = endTimestamp.getTime();

      if (now < startTime) {
        setStatus("upcoming");
        return "upcoming";
      } else if (now >= startTime && now < endTime) {
        setStatus("live");
        return "live";
      } else {
        setStatus("ended");
        return "ended";
      }
    };

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const currentStatus = calculateStatus();
      
      // Calculate time difference based on status
      let difference = 0;
      if (currentStatus === "upcoming") {
        difference = expiryTimestamp.getTime() - now;
      } else if (currentStatus === "live") {
        difference = endTimestamp.getTime() - now;
      }

      // Don't update if event has ended
      if (currentStatus === "ended") {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Recalculate status when timer reaches zero
        calculateStatus();
      }
    };

    // Initial calculation
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [expiryTimestamp, endTimestamp]);

  // Render different UI based on event status
  const renderCountdown = () => {
    if (status === "ended") {
      return (
        <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <AlertTriangle size={18} className="text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">Event has ended</span>
        </div>
      );
    }

    if (status === "live") {
      return (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="relative">
            <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          </div>
          <div>
            <span className="text-green-700 dark:text-green-400 font-medium">Live now</span>
            <p className="text-xs text-green-600 dark:text-green-500">
              Ends in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <Clock size={18} className="text-blue-600 dark:text-blue-400" />
        <div>
          <span className="text-blue-700 dark:text-blue-400 font-medium">Starting in</span>
          <div className="flex gap-2 text-xs text-blue-600 dark:text-blue-500">
            {timeLeft.days > 0 && (
              <span>{timeLeft.days}d</span>
            )}
            <span>{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
            <span>{timeLeft.seconds}s</span>
          </div>
        </div>
      </div>
    );
  };

  return renderCountdown();
};

export default EventCountdown;
