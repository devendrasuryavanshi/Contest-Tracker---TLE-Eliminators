import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Code,
    Calendar,
    Trophy,
    Bookmark,
    ExternalLink,
    ArrowRight,
    Sparkles,
    Bell
} from 'lucide-react';
import { Button } from '@nextui-org/react';
import codeforcesLogo from '../assets/images/codeforces-logo.png';
import leetcodeLogo from '../assets/images/leetcode-logo.png';
import codechefLogo from '../assets/images/codechef-logo.png';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    const featureItems = [
        {
            icon: <Bell className="w-6 h-6" />,
            title: "Real-time Notifications",
            description: "Get notified before contests start so you never miss an opportunity to participate and improve your skills."
        },
        {
            icon: <Bookmark className="w-6 h-6" />,
            title: "Personalized Bookmarks",
            description: "Save contests you're interested in and create your own personalized competition schedule."
        },
        {
            icon: <ExternalLink className="w-6 h-6" />,
            title: "Solution Links",
            description: "Access video explanations and solutions for past contests directly from our curated YouTube playlists."
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: "Multi-Platform Support",
            description: "Track contests across Codeforces, LeetCode, and CodeChef all in one place with powerful filtering options."
        }
    ];

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 opacity-70"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <motion.div
                            className="flex-1 max-w-2xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.h1
                                className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                Master <span className="text-purple-600 dark:text-purple-400">competitive coding</span> with ease
                            </motion.h1>

                            <motion.p
                                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                            >
                                Track contests from Codeforces, LeetCode, and CodeChef all in one place.
                                Never miss a competition and improve your programming skills.
                            </motion.p>

                            <motion.div
                                className="flex flex-wrap gap-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            >
                                <Button
                                    size="lg"
                                    color="primary"
                                    endContent={<ArrowRight className="ml-1" size={18} />}
                                    className="font-medium text-base"
                                    onClick={() => navigate('/contest-tracker')}
                                >
                                    Explore Contests
                                </Button>
                                <Button
                                    size="lg"
                                    variant="bordered"
                                    className="font-medium text-base"
                                    onClick={() => navigate('/bookmarks')}
                                >
                                    View Bookmarks
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="flex-1 w-full max-w-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    {
                                        title: "Track Contests",
                                        description: "Find upcoming contests from multiple platforms",
                                        icon: <Calendar className="w-6 h-6 text-purple-500" />,
                                        color: "bg-purple-50 dark:bg-purple-900/20"
                                    },
                                    {
                                        title: "Save Favorites",
                                        description: "Bookmark contests you're interested in",
                                        icon: <Bookmark className="w-6 h-6 text-blue-500" />,
                                        color: "bg-blue-50 dark:bg-blue-900/20"
                                    },
                                    {
                                        title: "Access Solutions",
                                        description: "Watch video explanations for past contests",
                                        icon: <Trophy className="w-6 h-6 text-amber-500" />,
                                        color: "bg-amber-50 dark:bg-amber-900/20"
                                    },
                                    {
                                        title: "Multiple Platforms",
                                        description: "Codeforces, LeetCode, and CodeChef in one place",
                                        icon: <Code className="w-6 h-6 text-green-500" />,
                                        color: "bg-green-50 dark:bg-green-900/20"
                                    }
                                ].map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className={`${feature.color} p-6 rounded-xl border border-gray-100 dark:border-gray-800`}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="mb-3">{feature.icon}</div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Platforms Section */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Supported Platforms</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Track contests from the most popular competitive programming platforms, all in one place.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, staggerChildren: 0.1 }}
                    >
                        {[
                            {
                                name: "Codeforces",
                                description: "Regular contests with a variety of problem difficulties",
                                logo: codeforcesLogo,
                                logoAlt: "Codeforces Logo"
                            },
                            {
                                name: "LeetCode",
                                description: "Weekly and biweekly contests focused on algorithmic problems",
                                logo: leetcodeLogo,
                                logoAlt: "LeetCode Logo"
                            },
                            {
                                name: "CodeChef",
                                description: "Long and short contests with diverse problem statements",
                                logo: codechefLogo,
                                logoAlt: "CodeChef Logo"
                            }
                        ].map((platform, index) => (
                            <motion.div
                                key={index}
                                className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center p-2 mb-4`}>
                                    <img
                                        src={platform.logo}
                                        alt={platform.logoAlt}
                                        className="w-16 h-16 object-contain rounded-full"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{platform.name}</h3>
                                <p className="text-center text-gray-600 dark:text-gray-300 text-sm">{platform.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -right-24 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40"></div>
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Everything you need to excel in competitive programming contests.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {featureItems.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow"
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                            >
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
