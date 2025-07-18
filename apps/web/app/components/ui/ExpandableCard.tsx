"use client"

import { ReactNode, useState } from "react"

interface ExpandableCardProps {
    header: ReactNode
    icon: ReactNode
    children: ReactNode
    defaultExpanded?: boolean
    className?: string
    headerClassName?: string
    contentClassName?: string
}

export default function ExpandableCard({
    header,
    icon,
    children,
    defaultExpanded = false,
    className = "",
    headerClassName = "",
    contentClassName = "",
}: ExpandableCardProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    return (
        <div className={`group ${className}`}>
            <div
                className={`flex items-center gap-4 cursor-pointer ${headerClassName}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">{header}</div>
                <div className="text-gray-400">
                    {/* Icon to indicate expand/collapse */}
                    {/* Rotate icon when expanded */}
                    <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>{icon}</span>
                </div>
            </div>
            {isExpanded && <div className={contentClassName}>{children}</div>}
        </div>
    )
}
