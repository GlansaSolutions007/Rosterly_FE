import React, { useState } from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import loadingGif from '../assets/Loading/Loading-circle.gif';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    const handleChange = (field, value) => {
        switch (field) {
            case 'firstName': setFirstName(value); break;
            case 'lastName': setLastName(value); break;
            case 'company': setCompany(value); break;
            case 'mobile': setMobile(value); break;
            case 'email': setEmail(value); break;
            case 'password': setPassword(value); break;
            case 'confirmPassword': setConfirmPassword(value); break;
            default: break;
        }

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const validate = () => {
        const newErrors = {};

        if (!firstName) newErrors.firstName = 'First name is required.';
        if (!lastName) newErrors.lastName = 'Last name is required.';
        if (!company) newErrors.company = 'Company name is required.';
        if (!mobile) newErrors.mobile = 'Mobile number is required.';
        else if (!/^\d{10}$/.test(mobile.replace(/\s/g, ''))) newErrors.mobile = 'Enter a valid 10-digit mobile number.';

        if (!email) newErrors.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address.';

        if (!password) newErrors.password = 'Password is required.';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

        if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

        if (!agreeTerms) newErrors.terms = 'You must agree to the terms and conditions.';

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            console.log('Registered successfully!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bgimg px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl md:w-[60%]">
                <h1 className="text-center text-2xl font-bold text-secondary mb-6">
                    Create Your Account
                </h1>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="w-full">
                            <label className="text-secondary font-semibold mb-1 block">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                className={`custom-focus w-full px-4 py-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                placeholder="Enter your first name"
                            />
                            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                        </div>

                        <div className="w-full">
                            <label className="text-secondary font-semibold mb-1 block">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                className={`custom-focus w-full px-4 py-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                placeholder="Enter your last name"
                            />
                            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="w-full">
                            <label className="text-secondary font-semibold mb-1 block">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={`custom-focus w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                placeholder="Enter your email"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="w-full">
                            <label className="text-secondary font-semibold mb-1 block">Mobile Number</label>
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => handleChange('mobile', e.target.value)}
                                className={`custom-focus w-full px-4 py-3 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                placeholder="Enter your mobile number"
                            />
                            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="w-full">
                            <label className="text-secondary font-semibold mb-1 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className={`custom-focus w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                    placeholder="Enter your password"
                                />
                                <span
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </span>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        <div className="w-full">
                            <label className="text-secondary font-semibold mb-1 block">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    className={`custom-focus w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg pr-12`}
                                    placeholder="Confirm your password"
                                />
                                <span
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </span>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="w-full">
                            <label className="text-secondary font-semibold mb-1 block">Company Name</label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => handleChange('company', e.target.value)}
                                className={`custom-focus w-full px-4 py-3 border ${errors.company ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                placeholder="Enter your company name"
                            />
                            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                        </div>
                        <div className="w-full">
                            <button
                                type="submit"
                                className={`w-full py-3 mt-7 text-black font-semibold rounded-xl flex items-center justify-center
                                transition-all duration-300 ease-in-out transform hover:scale-105 loginButton
                                ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <img src={loadingGif} alt="Loading..." className="h-5 w-5 mr-2 animate-spin" />
                                        Get Started
                                    </>
                                ) : (
                                    'Get Started'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
                <p className="text-center mt-2 text-sm text-gray-600">
                    "Already have an account?"
                    <Link
                        to="/"
                        className="ml-1 text-primary cursor-pointer font-semibold hover:underline"
                    >
                        "Login here"
                    </Link>
                </p>
            </div>
        </div>
    );
} 