export default function ExercisePage() {
    return (
        <div className="container mx-auto p-8">
            <div className="bg-gray-100 p-6 rounded-lg">
                {/* Exercise content/interface would go here */}
                <div className="flex justify-end mt-4">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        // onClick={() => console.log("Check solution")}
                    >
                        Check Solution
                    </button>
                </div>
            </div>
        </div>
    )
}
