import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LessonPane({ exercise }) {
    return (
        <div className="w-full bg-white text-black shadow-xl border-r border-gray-200 overflow-auto">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 border-b">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium">
                        <ChevronLeft className="inline-block w-5 h-5 mr-1"/> Back
                    </Link>
                    <span className="text-sm font-semibold uppercase tracking-wide text-orange-400">Exercise</span>
                </div>
            </div>
            <div className="p-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2">
                        {exercise.title}
                    </h2>
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg mb-4 border-l-4 border-orange-500">
                        <p className="text-gray-800">
                            <span className="font-bold text-orange-600 uppercase tracking-wide text-sm">Objective:</span>
                            <span className="ml-2">{exercise.exerciseDescription}</span>
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-gray-800">
                            <span className="font-bold text-blue-600 uppercase tracking-wide text-sm">Concepts:</span>
                            <span className="ml-2">{exercise.concept}</span>
                        </p>
                    </div>
                </div>
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
                        <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm uppercase tracking-wide">Instructions</span>
                    </h3>
                    <ol className="space-y-3">
                        {exercise.stepByStep.map((step, index) => (
                            <li key={index} className="flex items-start">
                                <span className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                                    {index + 1}
                                </span>
                                <span className="text-gray-700 leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
                <details className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg overflow-hidden shadow-sm">
                    <summary className="bg-gradient-to-r from-yellow-200 to-yellow-300 p-4 font-bold uppercase cursor-pointer hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 text-yellow-800 tracking-wide text-sm">
                        💡 Hints
                    </summary>
                    <div className="p-4">
                        <ul className="space-y-2">
                            {exercise.hints.map((hint, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-yellow-500 mr-2 flex-shrink-0">•</span>
                                    <span className="text-gray-700">{hint}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            </div>
        </div>
    )
}
