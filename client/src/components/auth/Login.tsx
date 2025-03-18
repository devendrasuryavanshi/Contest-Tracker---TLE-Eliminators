import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const { login, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/contest-tracker');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (error) {
            setFormError(error);
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        clearError();
        setFormError('');

        if (!email || !password) {
            setFormError('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md border-none shadow-lg dark:bg-black/40 bg-white">
                <CardHeader className="flex flex-col gap-1 items-center pb-6">
                    <h1 className="text-2xl font-bold text-center dark:text-white">Welcome Back</h1>
                    <p className="text-black/60 dark:text-white/60 text-center text-sm">
                        Log in to your account to continue
                    </p>
                </CardHeader>
                <Divider className="dark:bg-white/10" />
                <CardBody className="py-8 px-6">
                    {formError && (
                        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Input
                                type="email"
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                startContent={<Mail className="w-4 h-4 text-black/40 dark:text-white/40" />}
                                isRequired
                                fullWidth
                                classNames={{
                                    label: "text-black/50 dark:text-white/60",
                                    input: "text-black dark:text-white",
                                    inputWrapper: "dark:bg-black/20 bg-black/5 dark:hover:bg-black/30 hover:bg-black/10"
                                }}
                            />
                        </div>

                        <div>
                            <Input
                                type="password"
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                startContent={<Lock className="w-4 h-4 text-black/40 dark:text-white/40" />}
                                isRequired
                                fullWidth
                                classNames={{
                                    label: "text-black/50 dark:text-white/60",
                                    input: "text-black dark:text-white",
                                    inputWrapper: "dark:bg-black/20 bg-black/5 dark:hover:bg-black/30 hover:bg-black/10"
                                }}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            color="primary"
                            isLoading={isSubmitting}
                            fullWidth
                            className="mt-2 font-medium"
                            size="lg"
                        >
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-black/60 dark:text-white/60 text-sm">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Login;
