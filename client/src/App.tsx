import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/global/Navbar';
import Footer from './components/global/Footer';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './pages/NotFound';
import ContestTracker from './pages/ContestTracker';
import BookmarksPage from './pages/BookmarksPage';
import SolutionManagementPage from './pages/SolutionManagementPage';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="flex flex-col min-h-screen dark:bg-gray-950 bg-gray-200">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            <Route element={<ProtectedRoute />}>
                                <Route path="/contest-tracker" element={<ContestTracker />} />
                                <Route path="/bookmarks" element={<BookmarksPage />} />
                                <Route path="/solution-management" element={<SolutionManagementPage />} />

                            </Route>

                            {/* 404 route */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
