import React from "react";
import { Code, Github, Linkedin, ExternalLink, Twitter, Instagram } from "lucide-react";
import { Link } from "@nextui-org/react";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        {
            title: "Navigation",
            links: [
                { name: "Home", path: "/" },
                { name: "Contests", path: "/contest-tracker" },
                { name: "Bookmarks", path: "/bookmarks" }
            ]
        },
        {
            title: "Resources",
            links: [
                { name: "Platform Status", path: "/status" },
                { name: "FAQ", path: "/faq" },
                { name: "Privacy Policy", path: "/privacy" }
            ]
        }
    ];

    const socialLinks = [
        {
            name: "GitHub",
            icon: <Github className="w-4 h-4 sm:w-5 sm:h-5" />,
            url: "https://github.com/devendrasuryavanshi"
        },
        {
            name: "LinkedIn",
            icon: <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />,
            url: "https://www.linkedin.com/in/devendrasuryavanshi/"
        },
        {
            name: "Twitter",
            icon: <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />,
            url: "https://x.com/Devendra_Dood"
        },
        {
            name: "Instagram",
            icon: <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />,
            url: "https://www.instagram.com/devendrasooryavanshee/"
        },
    ];

    return (
        <footer className="w-full py-6 sm:py-12 px-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                    <div className="col-span-2 sm:col-span-1 mb-4 sm:mb-0">
                        <div className="flex items-center gap-2 mb-3">
                            <Code size={20} className="text-purple-500" />
                            <span className="font-bold text-lg text-gray-900 dark:text-white">ContestTracker</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Your one-stop solution for tracking competitive programming contests across multiple platforms.
                        </p>
                        <div className="flex space-x-3">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {footerLinks.map((section, index) => (
                        <div key={index} className="col-span-1">
                            <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2">{section.title}</h3>
                            <ul className="space-y-1.5">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link
                                            href={link.path}
                                            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div className="col-span-2 sm:col-span-1">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Supported Platforms</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5">
                            {[
                                { name: "Codeforces", url: "https://codeforces.com" },
                                { name: "LeetCode", url: "https://leetcode.com" },
                                { name: "CodeChef", url: "https://codechef.com" }
                            ].map((platform, index) => (
                                <a
                                    key={index}
                                    href={platform.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                >
                                    <span>{platform.name}</span>
                                    <ExternalLink size={10} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>

                <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:text-left text-xs text-gray-500 dark:text-gray-400">
                    <div className="mb-3 sm:mb-0">
                        © {currentYear} Contest Tracker. All rights reserved.
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/terms" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/cookies" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
