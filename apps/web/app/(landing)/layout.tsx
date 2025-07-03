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
        <div className="flex flex-col max-w-6xl m-auto min-h-screen">
            <header>
                <nav className="flex justify-between items-center p-4">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/"
                            className="font-bold text-3xl flex items-center gap-1 hover:text-orange-500"
                        >
                            <Cog className="h-8 w-8 animate-[spin_8s_linear_infinite]" />
                            Click & Whirr
                        </Link>
                        <span className="text-gray-500 ml-2">|</span>
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="hover:text-orange-500">
                                Courses
                            </Link>
                            <Link href="/" className="hover:text-orange-500">
                                Projects
                            </Link>
                            <Link href="/" className="hover:text-orange-500">
                                Resources
                            </Link>
                            <Link href="/" className="hover:text-orange-500">
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
                            className="bg-orange-500 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors duration-200"
                        >
                            Get Notified
                        </button>
                    </div>
                </nav>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="flex items-center justify-between p-4">
                <nav className="flex space-x-4">
                    <Link href="/privacy" className="hover:text-orange-500">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-orange-500">
                        Terms of Service
                    </Link>
                </nav>
                <p>
                    Made with ❤️ in Boulder, CO © {new Date().getFullYear()}{" "}
                    <Link
                        href="https://rgrl.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        RGRL
                    </Link>
                </p>
            </footer>
        </div>
    )
}
