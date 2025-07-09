"use client"

import { useState } from "react"
import {
    BarChart3,
    User,
    BookOpen,
    Trophy,
    Settings,
    LogOut
} from "lucide-react"
import Link from "next/link"
import { SignOutButton } from "@clerk/nextjs"

export default function DashboardNav() {
    const [activeTab, setActiveTab] = useState("dashboard")

    return (
        <>
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <nav className="p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeTab === "dashboard"
                                    ? "bg-orange-100 text-orange-700"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <BarChart3 className="h-5 w-5" />
                            <span className="font-medium">Dashboard</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeTab === "profile"
                                    ? "bg-orange-100 text-orange-700"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <User className="h-5 w-5" />
                            <span className="font-medium">Profile</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("courses")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeTab === "courses"
                                    ? "bg-orange-100 text-orange-700"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <BookOpen className="h-5 w-5" />
                            <span className="font-medium">Courses</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("achievements")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeTab === "achievements"
                                    ? "bg-orange-100 text-orange-700"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Trophy className="h-5 w-5" />
                            <span className="font-medium">Achievements</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeTab === "settings"
                                    ? "bg-orange-100 text-orange-700"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Settings className="h-5 w-5" />
                            <span className="font-medium">Settings</span>
                        </button>
                        <div className="border-t border-gray-200 my-2"></div>
                        <SignOutButton>
                            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100 transition-colors">
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </SignOutButton>
                    </nav>
                </div>
                <div className="text-center text-gray-500 mt-4">
                    <p>Help us build the future of robotics education</p>
                    <Link href={"/membership"} className="text-orange-600 hover:underline">
                        Subscribe
                    </Link>
                </div>
            </div>
        </>
    )
}
