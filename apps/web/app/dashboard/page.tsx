import DashboardNav from "../components/ui/dashboardNav";
import Link from "next/link";

export default function Dashboard() {
    return (
        <div className="flex justify-center">
            <DashboardNav />
            <div className="flex flex-col">
                <div>
                    {/* TODO: Add user-specific data */}
                    {/* TODO: Add badge for early supporters */}
                    <h1>Welcome back, User!</h1>
                    <p>Ready to continue learning robotics?</p>
                    <div>
                        <p>streak: 5 days</p>
                        <p>time spent building: 10 hours</p>
                    </div>
                </div>
                <div>
                    <h2>Continue Learning</h2>
                    <Link href={"/courses"} className="text-orange-600 hover:underline">
                        View Courses
                    </Link>
                </div>
            </div>
        </div>
    );
}
