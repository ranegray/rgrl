import { ExerciseSelect, StepSelect } from "@/app/lib/db/schema"
import { Square, SquareCheckBig, ChevronDown } from "lucide-react"
import ExpandableCard from "./ExpandableCard"

export default function LessonPane({
    exerciseData,
    stepData,
    userExerciseProgress,
}: {
    exerciseData: ExerciseSelect
    stepData: StepSelect[]
    userExerciseProgress: { completedSteps: string[] }
}) {
    return (
        <div className="flex h-full w-full flex-col bg-white shadow-xl border-x border-gray-200">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 border-b">
                <h3 className="font-semibold text-sm">{exerciseData.title}</h3>
            </div>
            <div className="p-4">
                <p>{exerciseData.description}</p>
            </div>
            <div className="p-4 border-t">
                <h4 className="font-semibold text-md mb-2">Instructions</h4>
                <ul className="space-y-2 list-decimal">
                    {stepData.map((step) => (
                        <div key={step.id} className={`flex p-8 ${userExerciseProgress.completedSteps.includes(step.id) ? "" : "bg-gray-500/25"}`}>
                            {userExerciseProgress.completedSteps.includes(
                                step.id
                            ) ? (
                                <SquareCheckBig className="w-4 h-4 text-green-500" />
                            ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                            )}
                            <li className="flex-1 ml-2">
                                <div className="flex items-start gap-2 mb-2">
                                    <span className="inline-block w-4 h-4 mt-0.5">
                                        {/* TODO ADD CHECKMARK FOR FAILED STEPS */}
                                        {/* TODO ADD LOGIC FOR GREYED OUT STEPS IF THEY ARE GREATER THAN CURRENT STEP INDEX */}
                                    </span>
                                    <span className="flex-1">{step.title}</span>
                                </div>

                                {step.hint ? (
                                    <ExpandableCard
                                        header={
                                            <div className="flex items-center gap-2 text-sm">
                                                <span>Could a hint help?</span>
                                            </div>
                                        }
                                        className="bg-orange-200 p-2 rounded-md"
                                        icon={<ChevronDown />}
                                    >
                                        {step.hint}
                                    </ExpandableCard>
                                ) : null}
                            </li>
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    )
}
