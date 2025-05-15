import { useState } from 'react';
import WorkoutSelectorModal from './WorkoutSelectorModal';
import WorkoutDetails from './WorkoutDetails';

export default function DayWorkoutCard({ day, workout, onSelect, onRemove }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-vdot-blue">{day}</h3>
        {workout ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Remove
          </button>
        ) : null}
      </div>
      
      {workout ? (
        <WorkoutDetails workout={workout} />
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
        >
          + Add Workout
        </button>
      )}
      
      <WorkoutSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(selectedWorkout) => {
          onSelect(selectedWorkout);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}