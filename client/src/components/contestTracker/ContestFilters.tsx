import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ChevronDown, X, Check } from "lucide-react";
import contestCalendarStore from "../../zustand/contestCalendar.store";
import { platformNames, contestsSupportedPlatforms } from "../../data/data";

const ContestFilters: React.FC = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    const platforms = contestCalendarStore((state) => state.platforms);
    const setPlatforms = contestCalendarStore((state) => state.setPlatforms);
    const setQuery = contestCalendarStore((state) => state.setQuery);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const togglePlatform = (platform: string) => {
        if (platforms.includes(platform)) {
            setPlatforms(platforms.filter(p => p !== platform));
        } else {
            setPlatforms([...platforms, platform]);
        }
    };

    const clearFilters = () => {
        setPlatforms([]);
        setQuery("");

        const searchInput = document.getElementById("contest-search") as HTMLInputElement;
        if (searchInput) {
            searchInput.value = "";
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get("search") as string;
        setQuery(searchQuery);
    };

    return (
        <div className="contest-filters">
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        id="contest-search"
                        name="search"
                        placeholder="Search contests..."
                        className="search-input"
                    />
                </div>
                <button type="submit" className="search-button dark:bg-purrple-400">
                    Search
                </button>
            </form>

            <div className="filter-container" ref={filterRef}>
                <button
                    className="filter-button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    <Filter size={16} />
                    <span>Filter</span>
                    <ChevronDown size={16} className={isFilterOpen ? "rotate-180" : ""} />
                </button>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            className="filter-dropdown"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="filter-header">
                                <h3>Filter by Platform</h3>
                                {platforms.length > 0 && (
                                    <button className="clear-filters" onClick={clearFilters}>
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <div className="platform-options">
                                {contestsSupportedPlatforms.map(platform => (
                                    <div
                                        key={platform}
                                        className={`platform-option ${platforms.includes(platform) ? "selected" : ""}`}
                                        onClick={() => togglePlatform(platform)}
                                    >
                                        <div className="platform-checkbox">
                                            {platforms.includes(platform) && <Check size={14} />}
                                        </div>
                                        <span>{platformNames.get(platform)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="filter-footer">
                                <div className="selected-count">
                                    {platforms.length === 0 ? (
                                        "All platforms selected"
                                    ) : (
                                        `${platforms.length} platform${platforms.length !== 1 ? "s" : ""} selected`
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {platforms.length > 0 && (
                <div className="selected-platforms">
                    {platforms.map(platform => (
                        <div key={platform} className="platform-tag">
                            <span>{platformNames.get(platform)}</span>
                            <button onClick={() => togglePlatform(platform)}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContestFilters;
