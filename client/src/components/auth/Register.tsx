import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const { register, error, clearError, isAuthenticated } = useAuth();
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

        if (!email || !password || !confirmPassword) {
            setFormError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setFormError('Password must be at least 6 characters long');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(email, password);
        } catch (err) {
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md border-none shadow-lg dark:bg-black/40 bg-white">
                <CardHeader className="flex flex-col gap-1 items-center pb-6">
                    <h1 className="text-2xl font-bold text-center dark:text-white">Create an Account</h1>
                    <p className="text-black/60 dark:text-white/60 text-center text-sm">
                        Sign up to track your favorite contests
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
                                placeholder="Create a password"
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

                        <div>
                            <Input
                                type="password"
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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

                        <Button
                            type="submit"
                            color="primary"
                            isLoading={isSubmitting}
                            fullWidth
                            className="mt-2 font-medium"
                            size="lg"
                        >
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-black/60 dark:text-white/60 text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Register;
