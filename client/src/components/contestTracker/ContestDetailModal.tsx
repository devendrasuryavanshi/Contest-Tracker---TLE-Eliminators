import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Timer, CalendarPlus, ExternalLink, X, Bookmark } from "lucide-react";
import { ContestSchema } from "../../types/contestTypes";
import { formatTime, generateGoogleCalendarUrl, getFormattedTimeStamp } from "../../utils/helper";
import ContestTimer from "./ContestTimer";
import axios from "axios";
import useStore from "../../zustand/useStore.store";
import { getPlatformIcon } from "../../utils/helper";
import { toast } from "sonner";
import { API_URL } from "../../config";

interface ContestDetailModalProps {
    contest: ContestSchema;
    onClose: () => void;
}

const ContestDetailModal: React.FC<ContestDetailModalProps> = ({ contest, onClose }) => {
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [solutionUrl, setSolutionUrl] = useState<string>(contest.solutionUrl || "");
    const [isAddingSolution, setIsAddingSolution] = useState(false);
    const [showSolutionInput, setShowSolutionInput] = useState(false);
    const [youtubeError, setYoutubeError] = useState<string | null>(null);
    const currentTheme = useStore((state) => state.currentTheme);
    const [canEditSolution, setCanEditSolution] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const url = `${API_URL}/auth/me`;

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200 && response.data.user) {
                    setCanEditSolution(response.data.user.email === "doraemon@gmail.com");
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    const formatContestDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (minutes === 0) {
            return `${hours} hours`;
        } else {
            return `${hours} hours ${minutes} minutes`;
        }
    };

    const handleBookmarkToggle = async () => {
        if (isBookmarking) return;

        try {
            setIsBookmarking(true);
            const newBookmarkState = !contest?.isBookmarked;

            const token = localStorage.getItem('token');
            const url = `${API_URL}/contests/bookmarkContest`;

            const response = await axios.post(url, {
                contestId: contest._id,
                isBookmarked: newBookmarkState,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                toast.success(newBookmarkState ? "Contest bookmarked!" : "Bookmark removed");
                contest.isBookmarked = newBookmarkState;
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);

            if (axios.isAxiosError(error) && error.response?.status === 401) {
                toast.error("Please log in to bookmark contests");
            } else {
                toast.error("Failed to update bookmark");
            }
        } finally {
            setIsBookmarking(false);
        }
    };


    const isValidYoutubeUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return youtubeRegex.test(url);
    };

    const getYouTubeVideoId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    }

    const handleAddSolution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isAddingSolution) return;

        setYoutubeError(null);

        if (!isValidYoutubeUrl(solutionUrl)) {
            setYoutubeError("Please enter a valid YouTube URL");
            return;
        }

        try {
            setIsAddingSolution(true);

            let formattedUrl = solutionUrl;
            if (!formattedUrl.startsWith('http')) {
                formattedUrl = `https://${formattedUrl}`;
                setSolutionUrl(formattedUrl);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Please log in to add solutions");
                return;
            }

            const url = `${API_URL}/contests/solutions/update`;

            const response = await axios.post(url,
                {
                    contestId: contest._id,
                    youtubeUrl: formattedUrl
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                setShowSolutionInput(false);
                contest.solutionUrl = formattedUrl;
            }
        } catch (error) {
            console.error("Error adding solution:", error);
        } finally {
            setIsAddingSolution(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
                <motion.div
                    className="w-full max-w-md max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                                <img
                                    src={getPlatformIcon(contest.platform, currentTheme)}
                                    alt={contest.platform}
                                    className="w-6 h-6 object-contain"
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{contest.platform}</h3>
                                <p className="text-base font-semibold text-gray-900 dark:text-white">Contest Details</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className={`flex items-center justify-center w-10 h-10 p-2 rounded-full transition-colors ${contest?.isBookmarked
                                    ? "bg-amber-100 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                                onClick={handleBookmarkToggle}
                                aria-label={contest?.isBookmarked ? "Remove bookmark" : "Add bookmark"}
                            >
                                <Bookmark
                                    size={20}
                                    className={contest?.isBookmarked ? "fill-current" : ""}
                                    strokeWidth={contest?.isBookmarked ? 1.5 : 2}
                                />
                            </button>

                            <button
                                className="w-10 h-10 p-2 flex items-center justify-center bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 overflow-y-auto flex-1">
                        {/* Timer */}
                        <div className="mb-5 sm:mb-6">
                            <ContestTimer
                                expiryTimestamp={new Date(contest.contestStartDate)}
                                endTimestamp={new Date(contest.contestEndDate)}
                            />
                        </div>

                        {/* Contest details */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                                    <Calendar size={14} className="opacity-70" /> Date
                                </span>
                                <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                                    {getFormattedTimeStamp(contest.contestStartDate)}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                                    <Clock size={14} className="opacity-70" /> Time
                                </span>
                                <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                                    {formatTime(contest.contestStartDate)}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                                    <Timer size={14} className="opacity-70" /> Duration
                                </span>
                                <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                                    {formatContestDuration(contest.contestDuration)}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                                    <CalendarPlus size={14} className="opacity-70" /> Add to
                                </span>
                                <a
                                    href={generateGoogleCalendarUrl(contest)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Google Calendar
                                </a>
                            </div>
                        </div>

                        {/* Solution section */}
                        {(solutionUrl || canEditSolution) && (
                            <div>
                                {solutionUrl ? (
                                    <div className="rounded-xl overflow-hidden">
                                        <div className="relative pb-[56.25%] h-0 bg-gray-100 dark:bg-gray-800">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(solutionUrl)}`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute top-0 left-0 w-full h-full"
                                            ></iframe>
                                        </div>
                                        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800">
                                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Solution Video</span>
                                            {canEditSolution && (
                                                <button
                                                    onClick={() => setShowSolutionInput(true)}
                                                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : canEditSolution && (
                                    <button
                                        onClick={() => setShowSolutionInput(true)}
                                        className="w-full py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-300 transition-colors"
                                    >
                                        <ExternalLink size={16} className="text-purple-500" />
                                        Add Solution Video
                                    </button>
                                )}

                                {showSolutionInput && (
                                    <motion.form
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3"
                                        onSubmit={handleAddSolution}
                                    >
                                        <div className="flex flex-col space-y-2">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={solutionUrl}
                                                    onChange={(e) => {
                                                        setSolutionUrl(e.target.value);
                                                        setYoutubeError(null);
                                                    }}
                                                    placeholder="YouTube URL"
                                                    className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-gray-800 border ${youtubeError ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                                                        } rounded-lg text-gray-900 dark:text-gray-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                                />
                                                {youtubeError && (
                                                    <p className="text-xs text-red-500 mt-1">{youtubeError}</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={isAddingSolution}
                                                    className="flex-1 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
                                                >
                                                    {isAddingSolution ? "Saving..." : "Save"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowSolutionInput(false);
                                                        setSolutionUrl(contest.solutionUrl || "");
                                                        setYoutubeError(null);
                                                    }}
                                                    className="flex-1 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Contest ID: {contest.contestId}
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={contest.contestUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors no-underline outline-none focus:outline-none focus:ring-0 focus:shadow-none hover:text-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Participate
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContestDetailModal;