import { useState } from "react";
import WeekSelector from "./WeekSelector";
import DayWorkoutCard from "./DayWorkoutCard";

import useTrainingPlan from "./hooks/useTrainingPlan";

export default function TrainingPlanForm() {
  const [startDate, setStartDate] = useState(new Date());
  const [weekNumber, setWeekNumber] = useState(1);
  const { createPlan, isLoading } = useTrainingPlan();
  const [error, setError] = useState(null);

  // Structure to hold workouts for each day
  const [workouts, setWorkouts] = useState({
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate total distance
    const totalDistance = Object.values(workouts)
      .filter((workout) => workout !== null)
      .reduce((total, workout) => total + (workout.totalDistance || 0), 0);

    try {
      await createPlan({
        date: startDate, // Ensure proper date format
        week: weekNumber,
        workouts: Object.entries(workouts)
          .filter(([_, workout]) => workout !== null)
          .map(([day, workout]) => ({
            day,
            workout: workout._id,
            comment: [" "], // Non-empty comment
          })),
      });
    } catch (error) {
      console.error("Error creating training plan:", error);
    }
  };

  const handleWorkoutSelect = (day, workout) => {
    setWorkouts((prev) => ({
      ...prev,
      [day]: workout,
    }));
  };

  const handleRemoveWorkout = (day) => {
    setWorkouts((prev) => ({
      ...prev,
      [day]: null,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-vdot-blue mb-6">
        Create Training Plan
      </h1>

      <div className="space-y-6">
        <WeekSelector
          startDate={startDate}
          onDateChange={setStartDate}
          weekNumber={weekNumber}
          onWeekChange={setWeekNumber}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(workouts).map(([day, workout]) => (
            <DayWorkoutCard
              key={day}
              day={day}
              workout={workout}
              onSelect={(workout) => handleWorkoutSelect(day, workout)}
              onRemove={() => handleRemoveWorkout(day)}
            />
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded bg-zinc-200/20 hover:bg-zinc-600 ${
              isLoading
                ? "bg-zinc-400 cursor-not-allowed"
                : "bg-vdot-blue text-white hover:bg-vdot-blue-dark"
            }`}
          >
            {isLoading ? "Saving..." : "Save Training Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
