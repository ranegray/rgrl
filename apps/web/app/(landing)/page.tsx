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
    return (
        <>
            <main className="flex flex-col items-center justify-center">
                {/* Header Section */}
                <section className="py-32 text-center">
                    <h1 className="text-6xl font-black text-center">
                        Build real robots.
                        <br />
                        Learn real skills.
                    </h1>
                    <h2 className="text-2xl">
                        Hands-on interactive lessons with actual robots.
                    </h2>
                    <div className="mt-8">
                        <label htmlFor="email" className="text-lg mb-2">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="border rounded-full px-4 py-2"
                                placeholder="you@awesome.com"
                            />
                        </label>
                        <button className="bg-orange-500 text-white px-4 py-2 rounded-full ml-2 hover:bg-orange-600 transition-colors duration-200">
                            Notify Me
                        </button>
                        <Link
                            href="/demo"
                            className="border border-orange-500 px-4 py-2.5 rounded-full ml-2 hover:bg-orange-600 hover:text-white transition-colors duration-200"
                        >
                            Try Demo
                        </Link>
                    </div>
                    <p className="mt-4 text-gray-500">
                        Get notified when we launch. No spam, just updates.
                    </p>
                </section>
                {/* Features Section */}
                <section className="py-32">
                    <h2 className="text-4xl font-bold text-center mb-6">
                        Why Click &amp; Whirr?
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {features.map(({ icon, title, desc }) => (
                            <div
                                key={title}
                                className="rounded-2xl shadow-lg bg-white hover:bg-orange-50 transition"
                            >
                                <div className="p-6 text-center">
                                    <div className="mb-4 mx-auto w-fit">
                                        {icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-1">
                                        {title}
                                    </h3>
                                    <p className="text-slate-600 text-sm">
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* How It Works */}
                <section className="py-32">
                    <h2 className="text-4xl font-bold text-center mb-6">
                        How It Works
                    </h2>
                    <div className="max-w-2xl mx-auto space-y-8">
                        {howItWorks.map(({ step, title, desc }) => (
                            <div key={step} className="flex items-start gap-5">
                                <span className="flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-full text-xl font-black flex-shrink-0">
                                    {step}
                                </span>
                                <div>
                                    <h3 className="text-2xl font-semibold">
                                        {title}
                                    </h3>
                                    <p className="mt-1 text-slate-700">
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Robots we're building for */}
                <section className="py-32">
                    <h2 className="text-4xl font-bold text-center mb-6">
                        Robots We&apos;re Building For
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 max-w-2xl mx-auto">
                        <p className="text-lg rounded-full shadow-md px-5 py-3 hover:bg-orange-50 transition">
                            SO-101
                        </p>
                        <p className="text-lg rounded-full shadow-md px-5 py-3 hover:bg-orange-50 transition">
                            LeKiwi Mobile Base
                        </p>
                        <p className="text-lg rounded-full shadow-md px-5 py-3 hover:bg-orange-50 transition">
                            More planned!
                        </p>
                    </div>
                </section>
                {/* FAQs */}
                <section id="faqs" className="py-24 w-full max-w-3xl">
                    <h2 className="text-4xl font-bold text-center mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div>
                        {faqs.map(({ q, a }, idx) => (
                            <details
                                key={idx}
                                className="border-b border-orange-300 pb-4 group"
                            >
                                <summary className="w-full flex gap-4 items-center text-left py-2 hover:text-orange-600 transition cursor-pointer list-none">
                                    <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
                                    <p className="text-lg font-medium select-none">
                                        {q}
                                    </p>
                                </summary>
                                <p className="mt-2 text-slate-700">{a}</p>
                            </details>
                        ))}
                    </div>
                </section>
            </main>
        </>
    )
}
