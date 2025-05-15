import { useState } from 'react';
import WeekSelector from './WeekSelector';
import DayWorkoutCard from './DayWorkoutCard';

import useTrainingPlan from './hooks/useTrainingPlan';

export default function TrainingPlanForm() {
  const [startDate, setStartDate] = useState(new Date());
  const [weekNumber, setWeekNumber] = useState(1);
  const { createPlan, isLoading } = useTrainingPlan();
  
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
    
    // Prepare workouts array for API
    const workoutEntries = Object.entries(workouts)
      .filter(([_, workout]) => workout !== null)
      .map(([day, workout]) => ({
        day,
        workout: workout._id,
        comment: [' '],
      }));

    await createPlan({
      date: startDate,
      week: weekNumber,
      workouts: workoutEntries,
    });
  };

  const handleWorkoutSelect = (day, workout) => {
    setWorkouts(prev => ({
      ...prev,
      [day]: workout,
    }));
  };

  const handleRemoveWorkout = (day) => {
    setWorkouts(prev => ({
      ...prev,
      [day]: null,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-vdot-blue mb-6">Create Training Plan</h1>
      
      <div  className="space-y-6">
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
          <button onClick={handleSubmit} type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Training Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}