"use client"

// import {
//     SignInButton,
//     SignUpButton,
//     SignedIn,
//     SignedOut,
//     UserButton,
// } from "@clerk/nextjs"
import { Cog } from "lucide-react"
import Link from "next/link"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <nav className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-8">
                        <Link
                            href="/"
                            className="font-bold text-2xl sm:text-3xl flex items-center gap-2 hover:text-orange-500 transition-colors duration-200"
                        >
                            <Cog className="h-8 w-8 text-orange-500 animate-[spin_8s_linear_infinite]" />
                            <span className="hover:text-orange-500 transition-colors duration-200">
                                Click & Whirr
                            </span>
                        </Link>
                        <div className="hidden lg:flex items-center space-x-8">
                            <Link href="/" className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium">
                                Courses
                            </Link>
                            <Link href="/" className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium">
                                Projects
                            </Link>
                            <Link href="/" className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium">
                                Resources
                            </Link>
                            <Link href="/" className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium">
                                Pricing
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* <Link href="/">Log In</Link>
                        <Link
                            href="/signup"
                            className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors duration-200"
                        >
                            Sign Up
                        </Link> */}

                        {/* <SignedOut>
                            <SignInButton />
                            <SignUpButton>
                                <button className="bg-orange-500 text-white rounded-full px-4 py-2 cursor-pointer hover:bg-orange-600 transition-colors duration-200">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn> */}

                        <button
                            onClick={() => {
                                const emailInput = document.getElementById(
                                    "email"
                                ) as HTMLInputElement | null
                                if (emailInput) {
                                    emailInput.focus()
                                    emailInput.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                    })
                                }
                            }}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            Get Notified
                        </button>
                    </div>
                </nav>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        <nav className="flex space-x-6">
                            <Link href="/privacy" className="text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium">
                                Terms of Service
                            </Link>
                        </nav>
                        <p className="text-gray-600 text-sm">
                            Made with ❤️ in Boulder, CO © {new Date().getFullYear()}{" "}
                            <Link
                                href="https://rgrl.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-500 hover:text-orange-600 transition-colors duration-200 font-medium"
                            >
                                RGRL
                            </Link>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
