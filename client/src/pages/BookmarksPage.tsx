import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkIcon, Calendar, Clock, Search, SlidersHorizontal, Timer, Trash2, X } from "lucide-react";
import { ContestSchema } from "../types/contestTypes";
import { formatTime, getFormattedTimeStamp } from "../utils/helper";
import ContestDetailModal from "../components/contestTracker/ContestDetailModal";
import ContestTimer from "../components/contestTracker/ContestTimer";
import { getPlatformIcon } from "../utils/helper";
import useStore from "../zustand/useStore.store";
import axios from "axios";
import { platformNames } from "../data/data";
import { toast } from "sonner";
import { Tabs, Tab } from "@nextui-org/react";
import { API_URL } from "../config";

const BookmarksPage: React.FC = () => {
    const [bookmarkedContests, setBookmarkedContests] = useState<ContestSchema[]>([]);
    const [filteredContests, setFilteredContests] = useState<ContestSchema[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedContest, setSelectedContest] = useState<ContestSchema | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<"all" | "upcoming" | "ongoing" | "ended">("all");
    const currentTheme = useStore((state) => state.currentTheme);

    useEffect(() => {
        const fetchBookmarkedContests = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Please log in to view your bookmarks");
                    setLoading(false);
                    return;
                }

                const url = `${API_URL}/contests/get-bookmarked-contests`;

                const response = await axios.get(
                    url,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.status && response.data.status.code === 200) {
                    setBookmarkedContests(response.data.data);
                } else {
                    toast.error("Failed to load bookmarked contests");
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    toast.error("Please log in to view your bookmarks");
                } else {
                    toast.error("Failed to load bookmarked contests");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarkedContests();
    }, []);

    useEffect(() => {
        let filtered = [...bookmarkedContests];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(contest =>
                contest.contestName.toLowerCase().includes(query) ||
                contest.platform.toLowerCase().includes(query)
            );
        }

        if (selectedPlatforms.length > 0) {
            filtered = filtered.filter(contest =>
                selectedPlatforms.includes(contest.platform)
            );
        }

        if (selectedStatus !== "all") {
            const now = new Date();

            if (selectedStatus === "upcoming") {
                filtered = filtered.filter(contest =>
                    new Date(contest.contestStartDate) > now
                );
            } else if (selectedStatus === "ongoing") {
                filtered = filtered.filter(contest =>
                    new Date(contest.contestStartDate) <= now &&
                    new Date(contest.contestEndDate) > now
                );
            } else if (selectedStatus === "ended") {
                filtered = filtered.filter(contest =>
                    new Date(contest.contestEndDate) <= now
                );
            }
        }

        setFilteredContests(filtered);
    }, [bookmarkedContests, searchQuery, selectedPlatforms, selectedStatus]);

    const handleRemoveBookmark = async (contestId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Please log in to manage bookmarks");
                return;
            }

            const url = `${API_URL}/contests/bookmarkContest`;

            const response = await axios.post(
                url,
                {
                    contestId,
                    isBookmarked: false
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                setBookmarkedContests(prev => prev.filter(contest => contest._id !== contestId));
                toast.success("Contest removed from bookmarks");
            } else {
                toast.error("Failed to remove bookmark");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                toast.error("Please log in to manage bookmarks");
            } else {
                toast.error("Failed to remove bookmark");
            }
        }
    };

    const openContestDetail = (contest: ContestSchema) => {
        setSelectedContest(contest);
        setIsModalOpen(true);
    };

    const getContestStatusClass = (contest: ContestSchema) => {
        const now = new Date();
        const startDate = new Date(contest.contestStartDate);
        const endDate = new Date(contest.contestEndDate);

        if (now < startDate) return "upcoming";
        if (now >= startDate && now < endDate) return "ongoing";
        return "ended";
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedPlatforms([]);
        setSelectedStatus("all");
        setShowFilters(false);
    };

    const togglePlatform = (platform: string) => {
        if (selectedPlatforms.includes(platform)) {
            setSelectedPlatforms(prev => prev.filter(p => p !== platform));
        } else {
            setSelectedPlatforms(prev => [...prev, platform]);
        }
    };

    const availablePlatforms = [...new Set(bookmarkedContests.map(contest => contest.platform))];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Bookmarked Contests
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your saved programming contests
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search contests..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <X size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                        <SlidersHorizontal size={18} />
                        <span>Filters</span>
                        {(selectedPlatforms.length > 0 || selectedStatus !== "all") && (
                            <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-purple-600 rounded-full">
                                {selectedPlatforms.length + (selectedStatus !== "all" ? 1 : 0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                                        >
                                            Clear all
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {["all", "upcoming", "ongoing", "ended"].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setSelectedStatus(status as any)}
                                                    className={`px-3 py-1.5 text-sm rounded-full capitalize ${selectedStatus === status
                                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platforms</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {availablePlatforms.map((platform) => (
                                                <button
                                                    key={platform}
                                                    onClick={() => togglePlatform(platform)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full ${selectedPlatforms.includes(platform)
                                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                        }`}
                                                >
                                                    <img
                                                        src={getPlatformIcon(platform, currentTheme)}
                                                        alt={platform}
                                                        className="w-4 h-4 object-contain"
                                                    />
                                                    <span>{platformNames.get(platform) || platform}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <div className="sm:hidden">
                    <Tabs
                        aria-label="Contest status"
                        color="secondary"
                        variant="light"
                        selectedKey={selectedStatus}
                        onSelectionChange={(key) => setSelectedStatus(key as any)}
                        classNames={{
                            base: "w-full",
                            tabList: "gap-2 w-full",
                            tab: "px-3 py-1.5 text-sm rounded-full",
                            cursor: "bg-purple-100 dark:bg-purple-900/30",
                            tabContent: "text-purple-600 dark:text-purple-400 group-data-[selected=true]:text-purple-700 dark:group-data-[selected=true]:text-purple-300"
                        }}
                    >
                        <Tab key="all" title="All" />
                        <Tab key="upcoming" title="Upcoming" />
                        <Tab key="ongoing" title="Ongoing" />
                        <Tab key="ended" title="Ended" />
                    </Tabs>
                </div>

                {/* Contest List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your bookmarks...</p>
                    </div>
                ) : filteredContests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <BookmarkIcon size={24} className="text-gray-400" />
                        </div>
                        {bookmarkedContests.length === 0 ? (
                            <>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookmarked contests</h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                    You haven't bookmarked any contests yet. Browse the Contest Tracker and click the star icon to bookmark contests.
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching contests</h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                    No contests match your current filters. Try adjusting your search or filter criteria.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContests.map((contest) => (
                            <motion.div
                                key={contest._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                                onClick={() => openContestDetail(contest)}
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${getContestStatusClass(contest) === "upcoming"
                                        ? "bg-blue-500"
                                        : getContestStatusClass(contest) === "ongoing"
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                    }`}></div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md mr-3">
                                                <img
                                                    src={getPlatformIcon(contest.platform, currentTheme)}
                                                    alt={contest.platform}
                                                    className="w-5 h-5 object-contain"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {platformNames.get(contest.platform) || contest.platform}
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => handleRemoveBookmark(contest._id, e)}
                                            className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            aria-label="Remove bookmark"
                                        >
                                            <Trash2 size={16} className="text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>

                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 line-clamp-2">
                                        {contest.contestName}
                                    </h3>

                                    <div className="mb-4">
                                        <ContestTimer
                                            expiryTimestamp={new Date(contest.contestStartDate)}
                                            endTimestamp={new Date(contest.contestEndDate)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Calendar size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {getFormattedTimeStamp(contest.contestStartDate)}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Clock size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatTime(contest.contestStartDate)}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-2 col-span-2">
                                            <Timer size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {Math.floor(contest.contestDuration / 3600)} hours
                                                {contest.contestDuration % 3600 > 0 && ` ${Math.floor((contest.contestDuration % 3600) / 60)} minutes`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && selectedContest && (
                <ContestDetailModal
                    contest={selectedContest}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedContest(null);
                    }}
                />
            )}
        </div>
    );
};

export default BookmarksPage;
