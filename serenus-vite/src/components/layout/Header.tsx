import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Heart,
    MessageCircle,
    Sparkles,
    Settings,
    LogOut,
    Shield,
    Menu,
    X,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LevelIndicator } from '@/components/gamification/LevelIndicator';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Heart },
        { path: '/diary', label: 'Diário', icon: null }, // Icon handled differently or text only
        { path: '/chat', label: 'Chat IA', icon: MessageCircle },
        { path: '/plans', label: 'Planos', icon: Sparkles },
        { path: '/settings', label: 'Configurações', icon: Settings },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Side: Logo or Back + Title */}
                    <div className="flex items-center gap-4">
                        {location.pathname !== '/dashboard' && (
                            <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 md:hidden">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        )}

                        <Link to="/dashboard" className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-neutral-800 font-headings hidden sm:block">
                                Essentia
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive(item.path)
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                {item.icon && <item.icon className={cn("w-4 h-4 mr-2", item.label === 'Planos' && "text-purple-500")} />}
                                {item.label}
                            </Link>
                        ))}

                        {user?.is_admin === 1 && (
                            <Link
                                to="/admin"
                                className={cn(
                                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive('/admin')
                                        ? "bg-purple-50 text-purple-700"
                                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                                )}
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* Right Side: Level & Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <LevelIndicator />
                        </div>

                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Sair"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <div className="px-3 py-2 mb-2">
                            <LevelIndicator />
                        </div>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center px-3 py-3 rounded-lg text-base font-medium",
                                    isActive(item.path)
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                                {item.label}
                            </Link>
                        ))}
                        {user?.is_admin === 1 && (
                            <Link
                                to="/admin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                            >
                                <Shield className="w-5 h-5 mr-3" />
                                Admin
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
