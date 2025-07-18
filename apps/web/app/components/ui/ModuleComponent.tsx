"use client"

import { ModuleContentSelect } from "@/app/lib/db/schema"
import Link from "next/link"
import ExpandableCard from "@/app/components/ui/ExpandableCard"
import { ChevronDown } from "lucide-react"

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
    const header = (
        <>
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
        </>
    )

    const content = (
        <div className="space-y-2">
            {contents.map((content) => (
                <Link
                    href={`/courses/${courseSlug}/${content.contentType}/${content.slug}`}
                    key={content.id}
                    className="flex justify-between hover:bg-gray-100 transition-colors p-3"
                >
                    <h4 className="text-md font-semibold text-gray-800">
                        {content.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                        {content.contentType}
                    </p>
                </Link>
            ))}
        </div>
    )

    return (
        <ExpandableCard header={header} icon={<ChevronDown />}>
            {content}
        </ExpandableCard>
    )
}
