import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LessonPane({ exercise }) {
    return (
        <div className="w-full bg-white text-black p-4 overflow-auto">
            <div className="flex gap-4 font-bold uppercase text-gray-500 p-2 border-b">
                <Link href="/" className="flex items-center hover:text-orange-500"><ChevronLeft className="inline-block"/> Back</Link>
                <p>Exercise</p>
            </div>
            <div className="p-4">
                <h2 className="text-xl uppercase font-bold mb-2">
                    {exercise.title}
                </h2>
                <p className="mb-4">
                    <span className="font-bold uppercase">Objective:</span>
                    {exercise.exerciseDescription}
                </p>
                <p className="mb-4">
                    <span className="font-bold uppercase">Concepts:</span>
                    {exercise.concept}
                </p>
                <div className="mt-5">
                    <h3 className="text-lg uppercase font-bold mb-2">
                        Instructions
                    </h3>
                    <ol className="list-inside list-decimal space-y-2 text-gray-800">
                        {exercise.stepByStep.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
                <details className="mt-5 bg-gray-100 p-2 rounded-md">
                    <summary className="font-bold uppercase cursor-pointer hover:text-orange-500">
                        Hints
                    </summary>
                    <ul className="mt-2 space-y-1 text-gray-700">
                        {exercise.hints.map((hint, index) => (
                            <li key={index}>{hint}</li>
                        ))}
                    </ul>
                </details>
            </div>
        </div>
    )
}
