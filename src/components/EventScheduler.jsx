import React, { useState, useMemo, useEffect } from "react";

const initialForm = {
    title: "",
    description: "",
    date: "",
    time: "",
    category: "Meeting",
};

const CATEGORY_COLORS = {
    Meeting: "border-blue-500 text-blue-400 bg-blue-950/30",
    Social: "border-pink-500 text-pink-400 bg-pink-950/30",
    Workshop: "border-amber-500 text-amber-400 bg-amber-950/30",
    Task: "border-purple-500 text-purple-400 bg-purple-950/30",
    Other: "border-emerald-500 text-emerald-400 bg-emerald-950/30",
};

// Helper function to get today's date in local YYYY-MM-DD format
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function EventScheduler({ user, onBack }) {
    const [form, setForm] = useState(initialForm);
    const [touched, setTouched] = useState({});
    const [events, setEvents] = useState(() => {
        const stored = localStorage.getItem("automata_events");
        return stored ? JSON.parse(stored) : [];
    });

    // Save events to local storage whenever they change
    useEffect(() => {
        localStorage.setItem("automata_events", JSON.stringify(events));
    }, [events]);

    const todayDateStr = useMemo(() => getTodayDateString(), []);

    // Form Validation logic
    const errors = useMemo(() => {
        const nextErrors = {};

        if (!form.title.trim()) {
            nextErrors.title = "Event title is required.";
        } else if (form.title.trim().length < 3) {
            nextErrors.title = "Title must be at least 3 characters.";
        }

        if (!form.date) {
            nextErrors.date = "Event date is required.";
        } else if (form.date < todayDateStr) {
            nextErrors.date = "Event date must be today or in the future.";
        }

        if (!form.time) {
            nextErrors.time = "Event time is required.";
        }

        if (!form.category) {
            nextErrors.category = "Please select a category.";
        }

        return nextErrors;
    }, [form, todayDateStr]);

    const isFormValid = Object.keys(errors).length === 0;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        const newEvent = {
            id: Date.now().toString(),
            ...form,
        };

        setEvents((prev) => [newEvent, ...prev]);
        setForm(initialForm);
        setTouched({});
    };

    const handleDelete = (id) => {
        setEvents((prev) => prev.filter((event) => event.id !== id));
    };

    return (
        <div className="w-full space-y-8">
            {/* Header / Welcoming Dashboard */}
            <div className="bg-gradient-to-r from-cyan-950/30 to-purple-950/30 p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                        Welcome, <span className="text-cyan-400">{user?.firstName || "Guest"} {user?.lastName || ""}</span>!
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Use the form below to schedule events. Past dates are automatically restricted.
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 border border-red-500/50 text-red-400 hover:bg-red-950/35 transition cursor-pointer"
                >
                    Log Out / Register New User
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 bg-black p-6 rounded-2xl shadow-lg border border-cyan-400 w-full h-fit">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-5">
                        Schedule New Event
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Event Title */}
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1.5">
                                Event Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Team Standup / Project Launch"
                                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            {touched.title && errors.title && (
                                <p className="text-sm text-red-400 mt-1.5">{errors.title}</p>
                            )}
                        </div>

                        {/* Event Date (Restricted min attribute) */}
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1.5">
                                Event Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                min={todayDateStr}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 scheme-dark"
                            />
                            {touched.date && errors.date && (
                                <p className="text-sm text-red-400 mt-1.5">{errors.date}</p>
                            )}
                        </div>

                        {/* Event Time */}
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1.5">
                                Event Time
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={form.time}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 scheme-dark"
                            />
                            {touched.time && errors.time && (
                                <p className="text-sm text-red-400 mt-1.5">{errors.time}</p>
                            )}
                        </div>

                        {/* Event Category */}
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1.5">
                                Category
                            </label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="Meeting">Meeting</option>
                                <option value="Social">Social</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Task">Task</option>
                                <option value="Other">Other</option>
                            </select>
                            {touched.category && errors.category && (
                                <p className="text-sm text-red-400 mt-1.5">{errors.category}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-cyan-200 mb-1.5">
                                Description (Optional)
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Add agenda, location, or notes..."
                                rows="3"
                                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`w-full py-3 rounded-lg font-semibold transition cursor-pointer ${
                                isFormValid
                                    ? "bg-cyan-500 text-black hover:bg-cyan-400"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            Schedule Event
                        </button>
                    </form>
                </div>

                {/* Event List Section */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-xl font-semibold text-cyan-400">
                        Scheduled Events ({events.length})
                    </h3>

                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-950/40 border border-cyan-500/20 border-dashed rounded-2xl text-center h-64">
                            <svg
                                className="w-12 h-12 text-cyan-500/40 mb-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                                />
                            </svg>
                            <p className="text-gray-400 font-medium">No events scheduled yet.</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Create an event using the form on the left.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 max-h-[580px] overflow-y-auto pr-1">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-gray-950/60 p-4 rounded-xl border border-cyan-500/25 flex justify-between items-start gap-4 hover:border-cyan-400 transition"
                                >
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-white text-lg">
                                                {event.title}
                                            </span>
                                            <span
                                                className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                                                    CATEGORY_COLORS[event.category] || "border-gray-500 text-gray-400 bg-gray-950/30"
                                                }`}
                                            >
                                                {event.category}
                                            </span>
                                        </div>

                                        {event.description && (
                                            <p className="text-sm text-gray-400">
                                                {event.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-xs text-cyan-300">
                                            <div className="flex items-center gap-1">
                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75"
                                                    />
                                                </svg>
                                                <span>{event.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <span>{event.time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-1 rounded bg-gray-900 border border-red-500/30 text-red-500 hover:bg-red-950/40 hover:border-red-500 transition cursor-pointer"
                                        title="Delete Event"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
