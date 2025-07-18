import { Bot, Wrench, GraduationCap, Rocket, ChevronRight } from "lucide-react"
import Link from "next/link"

const features = [
    {
        icon: <Bot className="h-8 w-8 text-orange-600" />,
        title: "Hands-On Projects",
        desc: "Build and program real robots from day one using our guided challenges.",
    },
    {
        icon: <Wrench className="h-8 w-8 text-orange-600" />,
        title: "Hardware Ready",
        desc: "Plug-and-play support for SO-101 Arm and LeKiwi Mobile Base. More platforms coming soon!",
    },
    {
        icon: <GraduationCap className="h-8 w-8 text-orange-600" />,
        title: "Expert Curriculum",
        desc: "Lessons crafted by robotics pros — start free, go pro for deep dives.",
    },
    {
        icon: <Rocket className="h-8 w-8 text-orange-600" />,
        title: "Career Boost",
        desc: "Earn badges and build a portfolio recruiters can't ignore.",
    },
]

const howItWorks = [
    {
        step: 1,
        title: "Join the Alpha",
        desc: "Get early access and start building real robots from day one.",
    },
    {
        step: 2,
        title: "Learn by Doing",
        desc: "Dive into step-by-step interactive projects that take you from setup to your first working robot.",
    },
    {
        step: 3,
        title: "Build. Share. Iterate.",
        desc: "Showcase your creations, get feedback from the community, and level up your skills together.",
    },
]

const faqs = [
    {
        q: "What hardware do I need?",
        a: "All you need is the SO-101 Arm or LeKiwi Mobile Base — no expensive lab required. We'll add more supported robots soon! 🤖",
    },
    {
        q: "Do I need any coding experience?",
        a: "Not at all! Our hands-on tutorials start with Python and ROS basics. Bring your curiosity — we'll help with the rest. 🚀",
    },
    {
        q: "When does the alpha launch?",
        a: "Sign up now to get exclusive early access updates. The beta is on track for Fall 2025! 🎉",
    },
]

export default function Home() {
    // TODO add redirected logic if user is logged in
    
    return (
        <>
            <main className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 min-h-screen">
                {/* Header Section */}
                <section className="py-20 lg:py-32 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center leading-tight text-gray-900">
                            Build real robots.
                            <br />
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                Learn real skills.
                            </span>
                        </h1>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl mt-6 text-gray-600 font-medium max-w-3xl mx-auto">
                            Hands-on interactive lessons with actual robots.
                        </h2>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
                            <Link
                                href="/sign-up"
                                className="w-full sm:w-auto bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 hover:text-white transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/demo"
                                className="w-full sm:w-auto border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                            >
                                Try Demo
                            </Link>
                        </div>
                        <p className="mt-6 text-gray-500 text-sm">
                            Get notified when we launch. No spam, just updates.
                        </p>
                    </div>
                </section>
                {/* Features Section */}
                <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white w-full">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                Why Click &amp; Whirr?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                The most effective way to learn robotics through hands-on experience
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map(({ icon, title, desc }) => (
                                <div
                                    key={title}
                                    className="group rounded-2xl shadow-lg bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                                >
                                    <div className="p-8 text-center">
                                        <div className="mb-6 mx-auto w-fit p-4 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors duration-300">
                                            {icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-gray-900">
                                            {title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* How It Works */}
                <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-orange-50 w-full">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                How It Works
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Get started with robotics in three simple steps
                            </p>
                        </div>
                        <div className="max-w-4xl mx-auto space-y-12">
                            {howItWorks.map(({ step, title, desc }) => (
                                <div key={step} className="flex flex-col sm:flex-row items-center sm:items-start gap-6 group">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full text-2xl font-black flex-shrink-0 shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
                                        {step}
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                                            {title}
                                        </h3>
                                        <p className="text-lg text-gray-600 leading-relaxed">
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* Robots we're building for */}
                <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white w-full">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                Robots We&apos;re Building For
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Start with these popular platforms, more coming soon
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-6 max-w-4xl mx-auto">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg px-8 py-4 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                <p className="text-lg font-semibold">
                                    SO-101
                                </p>
                            </div>
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg px-8 py-4 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                <p className="text-lg font-semibold">
                                    LeKiwi Mobile Base
                                </p>
                            </div>
                            <div className="bg-gray-100 text-gray-700 rounded-full shadow-lg px-8 py-4 hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-dashed border-gray-300">
                                <p className="text-lg font-semibold">
                                    More planned!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* FAQs */}
                <section id="faqs" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-orange-50 w-full">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-xl text-gray-600">
                                Everything you need to know to get started
                            </p>
                        </div>
                        <div className="space-y-4">
                            {faqs.map(({ q, a }, idx) => (
                                <details
                                    key={idx}
                                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow duration-300"
                                >
                                    <summary className="w-full flex gap-4 items-center text-left p-6 hover:bg-orange-50 transition-colors cursor-pointer list-none">
                                        <ChevronRight className="h-6 w-6 text-orange-500 transition-transform group-open:rotate-90" />
                                        <p className="text-lg font-semibold text-gray-900 select-none">
                                            {q}
                                        </p>
                                    </summary>
                                    <div className="px-6 pb-6">
                                        <p className="text-gray-600 leading-relaxed ml-10">{a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
