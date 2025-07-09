import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
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
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium"
                            >
                                Courses
                            </Link>
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium"
                            >
                                Projects
                            </Link>
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium"
                            >
                                Resources
                            </Link>
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium"
                            >
                                Pricing
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <SignedOut>
                            <Link
                                href="/sign-in"
                                className="rounded-full px-4 py-2 cursor-pointer hover:text-orange-600 transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="bg-orange-500 text-white text-semibold rounded-full px-4 py-2 cursor-pointer hover:bg-orange-600 transition-colors duration-200"
                            >
                                Sign Up
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </nav>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        <nav className="flex space-x-6">
                            <Link
                                href="/privacy"
                                className="text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium"
                            >
                                Terms of Service
                            </Link>
                        </nav>
                        <p className="text-gray-600 text-sm">
                            Made in Boulder, CO © {new Date().getFullYear()}{" "}
                            <Link
                                href="https://rgrl.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-500 hover:text-orange-600 transition-colors duration-200 font-medium"
                            >
                                Click & Whirr
                            </Link>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
