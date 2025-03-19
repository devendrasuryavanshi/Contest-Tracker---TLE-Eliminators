import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ContestSchema } from "../../types/contestTypes";
import { filterContestsData } from "../../utils/helper";
import { contestsSupportedPlatforms } from "../../data/data";
import ContestFilters from "./ContestFilters";
import ContestCard from "./ContestCard";
import ContestDetailModal from "./ContestDetailModal";
import { motion } from "framer-motion";
import useGlobalStore from "../../zustand/globalStore";
import { Calendar as CalendarIcon, List, Grid3X3 } from "lucide-react";
import "./ContestDashboard.css";
import axios from "axios";
import { API_URL } from "../../config";

const localizer = momentLocalizer(moment);

const ContestDashboard: React.FC = () => {
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
    const [selectedContest, setSelectedContest] = useState<ContestSchema | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [calendarView, setCalendarView] = useState(Views.MONTH);
    const [calendarDate, setCalendarDate] = useState(new Date());

    const contests = useGlobalStore((state) => state.contests);
    const setContests = useGlobalStore((state) => state.setContests);
    const platforms = useGlobalStore((state) => state.platforms);
    const query = useGlobalStore((state) => state.query);
    const setCurrentMonth = useGlobalStore((state) => state.setCurrentMonth);

    const [filteredContests, setFilteredContests] = useState<ContestSchema[]>([]);

    const [upcomingContests, setUpcomingContests] = useState<ContestSchema[]>([]);
    const [loadingUpcoming, setLoadingUpcoming] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    const getTokenFromLocalStorage = useCallback(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken && storedToken !== token) {
            setToken(storedToken);
            return storedToken;
        }
        return token;
    }, [token]);

    const fetchUpcomingContests = useCallback(async () => {
        try {
            setLoadingUpcoming(true);
            const currentToken = getTokenFromLocalStorage() || "";

            const url = `${API_URL}/contests/get-upcoming-contests`;
            const response = await axios.get(url, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${currentToken}`,
                },
            });
            const data = await response.data;

            if (data.status.code === 200) {
                setUpcomingContests(data.data);
            } else {
                console.error(data.status.error);
            }
        } catch (error) {
            console.error("Failed to fetch upcoming contests:", error);
        } finally {
            setLoadingUpcoming(false);
        }
    }, []);

    useEffect(() => {
        if (viewMode === "list") {
            fetchUpcomingContests();
        }
    }, [viewMode, fetchUpcomingContests]);

    const [filteredUpcomingContests, setFilteredUpcomingContests] = useState<ContestSchema[]>([]);

    useEffect(() => {
        if (platforms.length === 0) {
            setFilteredUpcomingContests(filterContestsData(upcomingContests, query, contestsSupportedPlatforms));
        } else {
            setFilteredUpcomingContests(filterContestsData(upcomingContests, query, platforms));
        }
    }, [upcomingContests, platforms, query]);

    const fetchContests = useCallback(async (start: Date, end: Date) => {
        try {
            setLoading(true);
            const currentToken = getTokenFromLocalStorage() || "";

            setCurrentMonth({ start, end });

            const params = new URLSearchParams();
            params.append("startDate", start.toISOString());
            params.append("endDate", end.toISOString());

            const url = `${API_URL}/contests/get-contests?${params}`;
            const response = await axios.get(url, {
                withCredentials: true,
                headers: {
                    authorization: `Bearer ${currentToken}`,
                }
            });
            const data = await response.data;

            if (data.status.code === 200) {
                setContests(data.data);
            } else {
                console.error(data.status.error);
            }
        } catch (error) {
            console.error("Failed to fetch contests:", error);
        } finally {
            setLoading(false);
        }
    }, [setContests, setCurrentMonth]);

    useEffect(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        fetchContests(startOfMonth, endOfMonth);
    }, [fetchContests]);

    useEffect(() => {
        if (platforms.length === 0) {
            setFilteredContests(filterContestsData(contests, query, contestsSupportedPlatforms));
        } else {
            setFilteredContests(filterContestsData(contests, query, platforms));
        }
    }, [contests, platforms, query]);

    const calendarEvents = filteredContests.map(contest => ({
        id: contest._id,
        title: contest.contestName,
        start: new Date(contest.contestStartDate),
        end: new Date(contest.contestEndDate),
        resource: contest
    }));

    const handleSelectEvent = (event: any) => {
        setSelectedContest(event.resource);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedContest(null);
    };

    const handleNavigate = (newDate: Date, view: any) => {
        setCalendarDate(newDate);

        if (view === Views.MONTH) {
            const startOfMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
            const endOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
            fetchContests(startOfMonth, endOfMonth);
        } else if (view === Views.WEEK) {
            const startOfWeek = moment(newDate).startOf('week').toDate();
            const endOfWeek = moment(newDate).endOf('week').toDate();
            fetchContests(startOfWeek, endOfWeek);
        } else if (view === Views.DAY) {
            const startOfDay = moment(newDate).startOf('day').toDate();
            const endOfDay = moment(newDate).endOf('day').toDate();
            fetchContests(startOfDay, endOfDay);
        } else if (view === Views.AGENDA) {
            const startOfMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
            const endOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
            fetchContests(startOfMonth, endOfMonth);
        }
    };

    const handleViewChange = (view: any) => {
        setCalendarView(view);

        if (view === Views.MONTH) {
            const startOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
            const endOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
            fetchContests(startOfMonth, endOfMonth);
        } else if (view === Views.WEEK) {
            const startOfWeek = moment(calendarDate).startOf('week').toDate();
            const endOfWeek = moment(calendarDate).endOf('week').toDate();
            fetchContests(startOfWeek, endOfWeek);
        } else if (view === Views.DAY) {
            const startOfDay = moment(calendarDate).startOf('day').toDate();
            const endOfDay = moment(calendarDate).endOf('day').toDate();
            fetchContests(startOfDay, endOfDay);
        } else if (view === Views.AGENDA) {
            const startOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
            const endOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
            fetchContests(startOfMonth, endOfMonth);
        }
    };

    return (
        <div className="contest-dashboard">
            <div className="dashboard-header">
                <h1 className="text-purple-500 font-bold text-5xl">Contest Tracker</h1>
                <p className="dashboard-subtitle">Track upcoming programming contests across multiple platforms</p>
            </div>

            <ContestFilters />

            <div className="view-toggle">
                <button
                    className={`view-toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
                    onClick={() => setViewMode("calendar")}
                >
                    <CalendarIcon size={18} />
                    <span>Calendar</span>
                </button>
                <button
                    className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                >
                    <List size={18} />
                    <span>Upcoming List</span>
                </button>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading contests...</p>
                </div>
            ) : (
                <>
                    {viewMode === "calendar" ? (
                        <motion.div
                            className="calendar-container"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Calendar
                                localizer={localizer}
                                events={calendarEvents}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: 650 }}
                                onSelectEvent={handleSelectEvent}
                                date={calendarDate}
                                view={calendarView}
                                onNavigate={handleNavigate}
                                onView={handleViewChange}
                                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}

                                eventPropGetter={(event) => {
                                    const platform = (event.resource as ContestSchema).platform.toLowerCase();
                                    return {
                                        className: `contest-event contest-event-${platform}`
                                    };
                                }}
                                dayPropGetter={(date) => {
                                    const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
                                    return {
                                        className: isCurrentMonth ? "" : "rbc-off-range-day"
                                    };
                                }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            className="contest-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {loadingUpcoming ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p>Loading upcoming contests...</p>
                                </div>
                            ) : filteredUpcomingContests.length > 0 ? (
                                <div className="contest-grid">
                                    {filteredUpcomingContests.map(contest => (
                                        <ContestCard
                                            key={contest._id}
                                            contest={contest}
                                            onClick={() => {
                                                setSelectedContest(contest);
                                                setIsModalOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="no-contests">
                                    <Grid3X3 size={48} />
                                    <p>No upcoming contests found matching your criteria</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </>
            )}

            {isModalOpen && selectedContest && (
                <ContestDetailModal
                    contest={selectedContest}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default ContestDashboard;
