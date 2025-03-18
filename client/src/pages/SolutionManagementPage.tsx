import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ContestSchema } from "../types/contestTypes";
import { getPlatformIcon, formatTime, getFormattedTimeStamp } from "../utils/helper";
import useStore from "../zustand/useStore.store";
import { platformNames } from "../data/data";
import { Search, Filter, Youtube, ExternalLink, Check, X, Loader2 } from "lucide-react";
import { API_URL } from "../config";

const SolutionManagementPage: React.FC = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [contests, setContests] = useState<ContestSchema[]>([]);
    const [filteredContests, setFilteredContests] = useState<ContestSchema[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [showPastOnly, setShowPastOnly] = useState(true);
    const currentTheme = useStore((state) => state.currentTheme);
    const navigate = useNavigate();

    const youtubePlaylistLinks = {
        leetcode: "https://www.youtube.com/playlist?list=PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
        codeforces: "https://www.youtube.com/playlist?list=PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
        codechef: "https://www.youtube.com/playlist?list=PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr"
    };

    useEffect(() => {
        const checkAuthorization = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setIsAuthorized(false);
                    setIsLoading(false);
                    return;
                }

                const url = `${API_URL}/auth/me`;

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200 && response.data.user) {
                    setIsAuthorized(response.data.user.email === "doraemon@gmail.com");
                } else {
                    setIsAuthorized(false);
                }
            } catch {
                setIsAuthorized(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthorization();
    }, []);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const endDate = new Date();
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 6);
                endDate.setMonth(endDate.getMonth() + 3);

                const params = new URLSearchParams();
                params.append("startDate", startDate.toISOString());
                params.append("endDate", endDate.toISOString());

                const url = `${API_URL}/contests/get-contests?${params}`;

                const response = await axios.get(
                    url,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.status && response.data.status.code === 200) {
                    setContests(response.data.data);
                } else {
                    toast.error("Failed to fetch contests");
                }
            } catch (error) {
                toast.error("Failed to fetch contests");
            }
        };

        if (isAuthorized) {
            fetchContests();
        }
    }, [isAuthorized]);

    useEffect(() => {
        let filtered = [...contests];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(contest =>
                contest.contestName.toLowerCase().includes(query)
            );
        }

        if (selectedPlatform) {
            filtered = filtered.filter(contest =>
                contest.platform.toLowerCase() === selectedPlatform.toLowerCase()
            );
        }

        if (showPastOnly) {
            const now = new Date();
            filtered = filtered.filter(contest =>
                new Date(contest.contestEndDate) < now
            );
        }

        filtered.sort((a, b) =>
            new Date(b.contestStartDate).getTime() - new Date(a.contestStartDate).getTime()
        );

        setFilteredContests(filtered);
    }, [contests, searchQuery, selectedPlatform, showPastOnly]);

    const handleAddSolution = async (contestId: string, youtubeUrl: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication required");
                return;
            }

            if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
                toast.error("Please enter a valid YouTube URL");
                return;
            }

            const url = `${API_URL}/contests/solutions/update`;

            const response = await axios.post(
                url,
                {
                    contestId,
                    youtubeUrl
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                setContests(prevContests =>
                    prevContests.map(contest =>
                        contest._id === contestId
                            ? { ...contest, solutionUrl: youtubeUrl }
                            : contest
                    )
                );

                toast.success("Solution URL added successfully");
            }
        } catch (error) {
            console.error("Failed to add solution URL:", error);

            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.status?.error || "Failed to add solution URL");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authorization...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <X size={32} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                    You don't have permission to access this page. This area is restricted to authorized team members only.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Solution Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add YouTube solution links to contests
                    </p>
                </div>

                {/* YouTube Playlists Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        YouTube Playlists
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(youtubePlaylistLinks).map(([platform, link]) => (
                            <a
                                key={platform}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <Youtube size={16} className="text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {platform} PCDs
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        YouTube Playlist
                                    </p>
                                </div>
                                <ExternalLink size={14} className="text-gray-400" />
                            </a>
                        ))}
                    </div>
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

                    <div className="flex gap-2">
                        <select
                            value={selectedPlatform || ""}
                            onChange={(e) => setSelectedPlatform(e.target.value || null)}
                            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                        >
                            <option value="">All Platforms</option>
                            <option value="leetcode">LeetCode</option>
                            <option value="codeforces">Codeforces</option>
                            <option value="codechef">CodeChef</option>
                        </select>

                        <button
                            onClick={() => setShowPastOnly(!showPastOnly)}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${showPastOnly
                                ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                                }`}
                        >
                            <Filter size={18} />
                            <span>Past Contests Only</span>
                        </button>
                    </div>
                </div>

                {/* Contest List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Platform
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Contest Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Solution
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredContests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No contests found matching your criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContests.map((contest) => (
                                        <ContestRow
                                            key={contest._id}
                                            contest={contest}
                                            onAddSolution={handleAddSolution}
                                            currentTheme={currentTheme}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ContestRowProps {
    contest: ContestSchema;
    onAddSolution: (contestId: string, youtubeUrl: string) => Promise<void>;
    currentTheme: string;
}

const ContestRow: React.FC<ContestRowProps> = ({ contest, onAddSolution, currentTheme }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState(contest.solutionUrl || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onAddSolution(contest._id, youtubeUrl);
            setIsEditing(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <img
                        src={getPlatformIcon(contest.platform, currentTheme)}
                        alt={contest.platform}
                        className="w-5 h-5 mr-2 object-contain"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                        {platformNames.get(contest.platform) || contest.platform}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                    <a
                        href={contest.contestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
                    >
                        {contest.contestName}
                    </a>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                        {getFormattedTimeStamp(contest.contestStartDate)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(contest.contestStartDate)}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900 dark:text-gray-100">
                    {Math.floor(contest.contestDuration / 3600)} hours
                    {contest.contestDuration % 3600 > 0 && ` ${Math.floor((contest.contestDuration % 3600) / 60)} minutes`}
                </span>
            </td>
            <td className="px-6 py-4">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="YouTube URL"
                            className="block w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                            required
                        />
                        <div className="flex gap-1">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Check size={16} />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setYoutubeUrl(contest.solutionUrl || "");
                                    setIsEditing(false);
                                }}
                                className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center gap-2">
                        {contest.solutionUrl ? (
                            <>
                                <a
                                    href={contest.solutionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:underline"
                                >
                                    <Youtube size={16} />
                                    <span>View Solution</span>
                                </a>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Edit
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                            >
                                <Youtube size={16} />
                                <span>Add Solution</span>
                            </button>
                        )}
                    </div>
                )}
            </td>
        </tr>
    );
};

export default SolutionManagementPage;
