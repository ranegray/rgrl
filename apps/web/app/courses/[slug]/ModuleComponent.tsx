"use client"

import { ModuleContentSelect } from "@/app/lib/db/schema"
import Link from "next/link"
import { useState } from "react"

export default function ModuleComponent({
    module,
    courseSlug,
    contents,
    index,
}: {
    module: {
        id: string
        title: string
    }
    courseSlug: string
    contents: Array<ModuleContentSelect>
    index: number
}) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 group">
            <div
                className="flex items-center gap-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                    {index + 1}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {module.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Module {index + 1} • Interactive tutorial
                    </p>
                </div>
                <div className="text-gray-400 group-hover:text-orange-500 transition-colors">
                    {/* Add lucide icon */}
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 space-y-2">
                    {contents.map((content) => (
                        <Link
                            href={`/courses/${courseSlug}/${content.contentType}/${content.slug}`}
                            key={content.id}
                            className="flex justify-between hover:bg-gray-100 transition-colors p-3"
                        >
                            <h4 className="text-md font-semibold text-gray-800">
                                {content.title}
                            </h4>
                            {/* TODO create a component that takes content type and returns an icon */}
                            <p className="text-sm text-gray-600">
                                {content.contentType}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
