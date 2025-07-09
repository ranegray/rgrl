import { currentUser } from "@clerk/nextjs/server"
import DashboardNav from "../components/ui/dashboardNav"
import Link from "next/link"
import { db } from "../lib/db"
import {
    courses,
    userProgress,
    type CourseSelect,
    type UserProgressSelect,
} from "../lib/db/schema"

export default async function Dashboard() {
    const user = await currentUser()

    // Fetch available courses - simplified query for now
    let availableCourses: CourseSelect[] = []
    let userProgressData: UserProgressSelect[] = []

    try {
        // For now, let's use a basic select without complex where clauses
        const allCourses = await db.select().from(courses)
        availableCourses = allCourses.filter(
            (course: CourseSelect) => course.isPublished
        )

        // Fetch user progress if user is logged in
        if (user?.id) {
            // Simple query to get user progress
            const progress = await db.select().from(userProgress)
            userProgressData = progress.filter(
                (p: UserProgressSelect) => p.userId === user.id
            )
        }
    } catch (error) {
        console.error("Database query error:", error)
        // Continue with empty arrays if queries fail
    }

    // Calculate progress statistics
    const totalCourses = availableCourses.length
    const coursesInProgress = userProgressData.length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
            <div className="flex gap-6 max-w-7xl mx-auto p-6">
                <DashboardNav />
                <div className="flex flex-col gap-6 flex-1">
                    {/* Welcome Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                        <h1 className="text-3xl font-bold mb-3 text-gray-900">
                            Welcome back,{" "}
                            <span className="text-orange-600">
                                {user?.firstName ? user.firstName : "friend"}
                            </span>
                            !
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Ready to continue learning robotics?
                        </p>
                    </div>

                    {/* Progress Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Available Courses
                            </h3>
                            <p className="text-4xl font-bold text-orange-600 mb-1">
                                {totalCourses}
                            </p>
                            <p className="text-sm text-gray-500">
                                Ready to start
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Courses In Progress
                            </h3>
                            <p className="text-4xl font-bold text-blue-600 mb-1">
                                {coursesInProgress}
                            </p>
                            <p className="text-sm text-gray-500">Keep going!</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Completion Rate
                            </h3>
                            <p className="text-4xl font-bold text-green-600 mb-1">
                                {totalCourses > 0
                                    ? Math.round(
                                          (coursesInProgress / totalCourses) *
                                              100
                                      )
                                    : 0}
                                %
                            </p>
                            <p className="text-sm text-gray-500">
                                Progress made
                            </p>
                        </div>
                    </div>

                    {/* Available Courses */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">
                            Available Courses
                        </h2>
                        {availableCourses.length > 0 ? (
                            <div className="grid gap-6">
                                {availableCourses.map(
                                    (course: CourseSelect) => (
                                        <div
                                            key={course.id}
                                            className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white"
                                        >
                                            <h3 className="font-bold text-xl text-gray-900 mb-2">
                                                {course.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 leading-relaxed">
                                                {course.description}
                                            </p>
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="inline-block bg-orange-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-orange-600 transition-colors duration-200"
                                            >
                                                Start Learning
                                            </Link>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg mb-4">
                                    No courses available yet.
                                </p>
                                <p className="text-gray-400">
                                    Check back soon for exciting robotics
                                    courses!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Recent Progress */}
                    {userProgressData.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                Your Recent Progress
                            </h2>
                            <div className="space-y-4">
                                {userProgressData
                                    .slice(0, 5)
                                    .map(
                                        (
                                            progress: UserProgressSelect,
                                            index: number
                                        ) => (
                                            <div
                                                key={index}
                                                className="border-l-4 border-orange-500 pl-6 py-3 bg-gradient-to-r from-orange-50 to-white rounded-r-lg"
                                            >
                                                <h4 className="font-semibold text-lg text-gray-900">
                                                    Course Progress
                                                </h4>
                                                <p className="text-gray-600 mb-2">
                                                    Lesson Progress
                                                </p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span className="flex items-center">
                                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                                        Step{" "}
                                                        {progress.currentStepIndex +
                                                            1}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                        {progress.completedSteps
                                                            ? progress
                                                                  .completedSteps
                                                                  .length
                                                            : 0}{" "}
                                                        steps completed
                                                    </span>
                                                    <span className="flex items-center">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                        Last active:{" "}
                                                        {progress.lastActiveAt
                                                            ? new Date(
                                                                  progress.lastActiveAt
                                                              ).toLocaleDateString()
                                                            : "Unknown"}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Get Started Section */}
                    {availableCourses.length === 0 && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                            <h2 className="text-2xl font-bold mb-3 text-gray-900">
                                No courses available yet
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Check back soon for new robotics courses!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
