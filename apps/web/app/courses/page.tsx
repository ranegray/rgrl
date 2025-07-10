// app/courses/page.tsx
import { db } from "@/app/lib/db";
import { courses } from "@/app/lib/db/schema";
// import { eq } from "drizzle-orm";
import { SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";

export default async function CoursesPage() {
    // Fetch all published courses
    const publishedCourses = await db
        .select()
        .from(courses);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Robotics Courses
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Master robotics through hands-on learning. From beginner-friendly introductions to advanced projects, 
                        build real skills with real robots.
                    </p>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
                        <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                            <BookOpen className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {publishedCourses.length}
                        </h3>
                        <p className="text-gray-600">
                            Available Courses
                        </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
                        <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Beginner
                        </h3>
                        <p className="text-gray-600">
                            Friendly Learning
                        </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
                        <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Interactive
                        </h3>
                        <p className="text-gray-600">
                            Hands-On Projects
                        </p>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        Start Your Robotics Journey
                    </h2>
                    
                    {publishedCourses.length > 0 ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {publishedCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
                                            <BookOpen className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                {course.title}
                                            </h3>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {course.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>Interactive</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>Beginner</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/courses/${course.slug}`}
                                            className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors group-hover:shadow-lg"
                                        >
                                            <span>Start Course</span>
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-6">
                                <BookOpen className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                No Courses Available Yet
                            </h3>
                            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                                We&apos;re working hard to bring you amazing robotics courses. 
                                Check back soon for updates!
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span>Go to Dashboard</span>
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Call to Action */}
                <SignedOut>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-8 mt-8 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">
                            Ready to Build Your First Robot?
                        </h2>
                        <p className="text-xl mb-6 opacity-90">
                            Join thousands of students learning robotics the hands-on way
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/sign-up"
                                className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                href="/demo"
                                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Try Demo
                            </Link>
                        </div>
                    </div>
                </SignedOut>
            </div>
        </div>
    );
}
