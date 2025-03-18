import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Timer, ExternalLink, Bookmark } from "lucide-react";
import { ContestSchema } from "../../types/contestTypes";
import { formatTime, getFormattedTimeStamp } from "../../utils/helper";
import useStore from "../../zustand/useStore.store";
import { getPlatformIcon } from "../../utils/helper";
import ContestTimer from "./ContestTimer";

interface ContestCardProps {
    contest: ContestSchema;
    onClick: () => void;
}

const ContestCard: React.FC<ContestCardProps> = ({ contest, onClick }) => {
    const currentTheme = useStore((state) => state.currentTheme);

    const formatContestDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (minutes === 0) {
            return `${hours} hrs`;
        } else {
            return `${hours} hrs ${minutes} mins`;
        }
    };

    return (
        <motion.div
            className="contest-card"
            onClick={onClick}
        >
            <div className="contest-card-header">
                <div className="platform-badge">
                    <img
                        src={getPlatformIcon(contest.platform, currentTheme)}
                        alt={contest.platform}
                        className="platform-icon"
                    />
                    <span>{contest.platform}</span>
                </div>
                {contest.isBookmarked && (
                    <Bookmark size={16} className="bookmark-icon" />
                )}
            </div>

            <h3 className="contest-title">{contest.contestName}</h3>

            <div className="contest-timer">
                <ContestTimer
                    expiryTimestamp={new Date(contest.contestStartDate)}
                    endTimestamp={new Date(contest.contestEndDate)}
                />
            </div>

            <div className="contest-details">
                <div className="detail-item">
                    <Calendar size={14} />
                    <span>{getFormattedTimeStamp(contest.contestStartDate)}</span>
                </div>

                <div className="detail-item">
                    <Clock size={14} />
                    <span>{formatTime(contest.contestStartDate)} - {formatTime(contest.contestEndDate)}</span>
                </div>

                <div className="detail-item">
                    <Timer size={14} />
                    <span>{formatContestDuration(contest.contestDuration)}</span>
                </div>
            </div>

            <div className="contest-card-footer">
                <button className="view-details-btn">
                    <span>View Details</span>
                    <ExternalLink size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default ContestCard;
