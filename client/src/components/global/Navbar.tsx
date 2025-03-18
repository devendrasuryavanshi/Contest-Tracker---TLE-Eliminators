import { useEffect, useState } from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link,
    Button,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar
} from "@nextui-org/react";
import { Code, BookmarkPlus, Calendar, LogOut, Youtube } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher/ThemeSwitcher";
import { useAuth } from "../../context/AuthContext";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";

const NavbarComponent = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const token = localStorage.getItem('token');

                const url = `${API_URL}/auth/me`;
                
                if (token) {
                    const response = await axios.get(url, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (response.status === 200 && response.data.user) {
                        setCurrentUserEmail(response.data.user.email);
                    }
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        if (isAuthenticated) {
            fetchUserEmail();
        }
    }, [isAuthenticated]);

    const menuItems = [
        { name: "Contests", href: "/contest-tracker", icon: <Calendar size={18} /> },
        { name: "Bookmarks", href: "/bookmarks", icon: <BookmarkPlus size={18} /> },
        ...(currentUserEmail === "doraemon@gmail.com" ? [
            { name: "Solution Management", href: "/solution-management", icon: <Youtube size={18} /> }
        ] : [])
    ];


    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => {
        return window.location.pathname === path;
    };

    return (
        <Navbar
            className="bg-white dark:bg-gray-900 transition-colors duration-300 shadow-sm"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            maxWidth="xl"
            isBordered
        >
            <NavbarContent justify="start">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden text-gray-900 dark:text-white dark:bg-gray-900 h-6"
                />

                <NavbarBrand className="flex gap-2 justify-start">
                    <Link className="text-black dark:text-white flex items-center gap-2" href="/">
                        <Code size={30} className="text-purple-600 dark:text-purple-400" />
                        <p className="font-bold text-xl hidden hover:text-black hover:dark:text-white sm:block">ContestTracker</p>
                    </Link>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-6" justify="center">
                {menuItems.map((item, index) => (
                    <NavbarItem key={index} isActive={isActive(item.href)}>
                        <Link
                            href={item.href}
                            className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors ${isActive(item.href) ? "font-medium text-primary dark:text-primary" : ""
                                }`}
                            aria-current={isActive(item.href) ? "page" : undefined}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem>
                    <ThemeSwitcher />
                </NavbarItem>
                {isAuthenticated ? (
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                as="button"
                                className="transition-transform text-md"
                                size="md"
                                name={user?.email.charAt(0).toUpperCase()}
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="User menu actions">
                            <DropdownItem
                                key="logout"
                                color="danger"
                                startContent={<LogOut className="w-4 h-4" />}
                                onClick={handleLogout}
                            >
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                ) : (
                    <>
                        <NavbarItem className="hidden sm:flex">
                            <Link as={RouterLink} to="/login" className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
                                Login
                            </Link>
                        </NavbarItem>
                        <NavbarItem>
                            <Button as={RouterLink} color="primary" to="/register" variant="flat">
                                Sign Up
                            </Button>
                        </NavbarItem>
                    </>
                )}
            </NavbarContent>

            <NavbarMenu className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md pt-6">
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={index}>
                        <Link
                            href={item.href}
                            className={`flex items-center gap-3 w-full py-2 text-lg ${isActive(item.href)
                                ? "text-primary font-medium"
                                : "text-gray-700 dark:text-gray-300"
                                }`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
}

export default NavbarComponent;
