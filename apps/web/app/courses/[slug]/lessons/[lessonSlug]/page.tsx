// app/courses/[slug]/lessons/[lessonSlug]/page.tsx
import { db } from "@/app/lib/db"
import { lessons, steps } from "@/app/lib/db/schema"
import { and, eq } from "drizzle-orm"

// Note: This would need to be a client component to use hooks,
// or you would need to pass the data to a client component.
// For simplicity, we'll imagine this is a server component fetching initial data.

export default async function LessonPage({
    params,
}: {
    params: Promise<{ slug: string; lessonSlug: string }>
}) {
    const { lessonSlug } = await params
    const [lesson] = await db
        .select()
        .from(lessons)
        .where(and(eq(lessons.slug, lessonSlug)))
        .limit(1)
    const lessonSteps = await db
        .select()
        .from(steps)
        .where(eq(steps.lessonId, lesson.id))
        .orderBy(steps.orderIndex)

    // This is a simplified example. You'll need to handle state for the IDE and terminal.
    // const [code, setCode] = useState(lessonSteps[0]?.initialCode || "");

    return (
        <div className="flex">
            <div className="w-1/3">
                {/* You can adapt the LessonPane to show the steps */}
                {/* <LessonPane exercise={lesson} /> */}
                <h2>{lesson.title}</h2>
                <div
                    dangerouslySetInnerHTML={{ __html: lesson.content || "" }}
                />
                <h3>Steps:</h3>
                <ul>
                    {lessonSteps.map((step) => (
                        <li key={step.id}>{step.title}</li>
                    ))}
                </ul>
            </div>
            <div className="w-2/3">
                {/* <IDE code={code} setCode={setCode} onRun={() => {}} /> */}
            </div>
        </div>
    )
}
