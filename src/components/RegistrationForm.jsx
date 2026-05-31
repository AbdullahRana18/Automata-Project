import React, { useMemo, useState } from "react";

const initialForm = {
    firstName: "",
    lastName: "",
    username: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
};

const pakCities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"];

function calculateAge(dob) {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }
    return age;
}

function validateEmailWithDFA(email) {
    if (!email) return false;

    const isAlphaNum = (char) => /[A-Za-z0-9]/.test(char);
    const isDomainChar = (char) => /[A-Za-z0-9-]/.test(char);

    let state = "START";
    let localCount = 0;
    let domainCount = 0;
    let tldCount = 0;

    for (const char of email) {
        if (state === "START" || state === "LOCAL") {
            if (isAlphaNum(char) || char === "." || char === "_" || char === "-") {
                state = "LOCAL";
                localCount += 1;
            } else if (char === "@" && localCount > 0) {
                state = "AT";
            } else {
                return false;
            }
        } else if (state === "AT" || state === "DOMAIN") {
            if (isDomainChar(char)) {
                state = "DOMAIN";
                domainCount += 1;
            } else if (char === "." && domainCount > 0) {
                state = "DOT";
            } else {
                return false;
            }
        } else if (state === "DOT" || state === "TLD") {
            if (/[A-Za-z]/.test(char)) {
                state = "TLD";
                tldCount += 1;
            } else {
                return false;
            }
        }
    }

    return state === "TLD" && tldCount >= 2;
}

function getPasswordRules(password) {
    return {
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*?&]/.test(password),
        hasMinLength: password.length >= 8,
    };
}

export default function RegistrationForm({ onRegisterSuccess }) {
    const [form, setForm] = useState(initialForm);
    const [touched, setTouched] = useState({});

    const passwordRules = useMemo(() => getPasswordRules(form.password), [form.password]);
    const passedRulesCount = Object.values(passwordRules).filter(Boolean).length;
    const passwordStrength = (passedRulesCount / 5) * 100;

    const errors = useMemo(() => {
        const nextErrors = {};

        if (!/^[A-Za-z]{3,}$/.test(form.firstName.trim())) {
            nextErrors.firstName = "First name must contain only letters and be at least 3 characters.";
        }

        if (!/^[A-Za-z]{3,}$/.test(form.lastName.trim())) {
            nextErrors.lastName = "Last name must contain only letters and be at least 3 characters.";
        }

        if (!/^[A-Za-z0-9_]{5,20}$/.test(form.username.trim())) {
            nextErrors.username =
                "Username must be 5-20 characters and can contain letters, numbers, underscore.";
        }

        const age = calculateAge(form.dob);
        if (!form.dob) {
            nextErrors.dob = "Date of birth is required.";
        } else if (age < 13) {
            nextErrors.dob = "Age must be at least 13 years.";
        }

        if (!form.gender) {
            nextErrors.gender = "Please select gender.";
        }

        if (!validateEmailWithDFA(form.email.trim())) {
            nextErrors.email = "Email is invalid (DFA validation failed).";
        }

        if (!/^03\d{9}$/.test(form.phone.trim())) {
            nextErrors.phone = "Phone number must be exactly 11 digits and start with 03.";
        }

        if (!form.city) {
            nextErrors.city = "Please select city.";
        }

        if (passedRulesCount < 5) {
            nextErrors.password =
                "Password must include uppercase, lowercase, number, special character and minimum 8 length.";
        }

        if (!form.confirmPassword) {
            nextErrors.confirmPassword = "Confirm password is required.";
        } else if (form.confirmPassword !== form.password) {
            nextErrors.confirmPassword = "Confirm password does not match.";
        }

        if (!form.termsAccepted) {
            nextErrors.termsAccepted = "You must accept terms and conditions.";
        }

        return nextErrors;
    }, [form, passedRulesCount]);

    const isFormValid = Object.keys(errors).length === 0;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const nextValue =
            name === "phone" ? value.replace(/\D/g, "").slice(0, 11) : value;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : nextValue,
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        if (onRegisterSuccess) {
            onRegisterSuccess({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
            });
        } else {
            alert("Form submitted successfully.");
        }
        setForm(initialForm);
        setTouched({});
    };

    const strengthLabel =
        passwordStrength >= 100
            ? "Strong"
            : passwordStrength >= 60
            ? "Medium"
            : passwordStrength > 0
            ? "Weak"
            : "None";

    return (
        <div className="bg-black p-6 rounded-2xl shadow-lg border border-cyan-400 w-full">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-5">
                Full Registration Form (Automata Validation)
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="First Name"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter first name"
                        error={touched.firstName ? errors.firstName : ""}
                    />
                    <InputField
                        label="Last Name"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter last name"
                        error={touched.lastName ? errors.lastName : ""}
                    />
                </div>

                <InputField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="username_123"
                    error={touched.username ? errors.username : ""}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Date of Birth"
                        type="date"
                        name="dob"
                        value={form.dob}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.dob ? errors.dob : ""}
                    />

                    <SelectField
                        label="Gender"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.gender ? errors.gender : ""}
                        options={[
                            { value: "", label: "Select gender" },
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Other", label: "Other" },
                        ]}
                    />
                </div>

                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="abc123@gmail.com"
                    error={touched.email ? errors.email : ""}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Phone Number"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="03XXXXXXXXX"
                        error={touched.phone ? errors.phone : ""}
                    />

                    <SelectField
                        label="City (Pakistan)"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.city ? errors.city : ""}
                        options={[
                            { value: "", label: "Select city" },
                            ...pakCities.map((city) => ({ value: city, label: city })),
                        ]}
                    />
                </div>

                <InputField
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Abdullah@123"
                    error={touched.password ? errors.password : ""}
                />

                <div className="mt-1">
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-2 transition-all ${
                                passwordStrength >= 100
                                    ? "bg-green-500"
                                    : passwordStrength >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                            style={{ width: `${passwordStrength}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-300 mt-1">Password strength: {strengthLabel}</p>
                    <ul className="mt-2 text-xs text-gray-300 space-y-1">
                        <li>{passwordRules.hasUpper ? "✔" : "✖"} Uppercase letter</li>
                        <li>{passwordRules.hasLower ? "✔" : "✖"} Lowercase letter</li>
                        <li>{passwordRules.hasNumber ? "✔" : "✖"} Number</li>
                        <li>{passwordRules.hasSpecial ? "✔" : "✖"} Special character (@$!%*?&)</li>
                        <li>{passwordRules.hasMinLength ? "✔" : "✖"} Minimum 8 characters</li>
                    </ul>
                </div>

                <InputField
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm password"
                    error={touched.confirmPassword ? errors.confirmPassword : ""}
                />

                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-200">
                        <input
                            type="checkbox"
                            name="termsAccepted"
                            checked={form.termsAccepted}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="accent-cyan-500"
                        />
                        I agree to Terms & Conditions
                    </label>
                    {touched.termsAccepted && errors.termsAccepted && (
                        <p className="text-sm text-red-400 mt-1">{errors.termsAccepted}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                        isFormValid
                            ? "bg-cyan-500 text-black hover:bg-cyan-400"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

function InputField({
    label,
    type = "text",
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    error,
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-cyan-200 mb-1.5">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {error && <p className="text-sm text-red-400 mt-1.5">{error}</p>}
        </div>
    );
}

function SelectField({ label, name, value, onChange, onBlur, error, options }) {
    return (
        <div>
            <label className="block text-sm font-medium text-cyan-200 mb-1.5">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                {options.map((option) => (
                    <option key={option.value || option.label} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-sm text-red-400 mt-1.5">{error}</p>}
        </div>
    );
}
