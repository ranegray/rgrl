// app/courses/[slug]/page.tsx
import { db } from "@/app/lib/db";
import { courses, lessons } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, Clock, Users } from "lucide-react";

export default async function CoursePage({ params }: { params: { slug: string } }) {
    const [course] = await db.select().from(courses).where(eq(courses.slug, params.slug)).limit(1);
    const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, course.id)).orderBy(lessons.orderIndex);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Course Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex items-start gap-6">
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <BookOpen className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{course.description}</p>
                            
                            {/* Course Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{courseLessons.length} lessons</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>~{courseLessons.length * 30} minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Beginner friendly</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lessons Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Lessons</h2>
                    {courseLessons.length > 0 ? (
                        <div className="space-y-4">
                            {courseLessons.map((lesson, index) => (
                                <Link
                                    key={lesson.id}
                                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                                    className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-orange-200 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Lesson {index + 1} • Interactive tutorial
                                            </p>
                                        </div>
                                        <div className="text-gray-400 group-hover:text-orange-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No lessons available yet.</p>
                            <p className="text-gray-400">Check back soon for updates!</p>
                        </div>
                    )}
                </div>

                {/* Back to Courses */}
                <div className="mt-8 text-center">
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Courses
                    </Link>
                </div>
            </div>
        </div>
    );
}
