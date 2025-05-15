// WorkoutSelectorModal.jsx
import { useState } from 'react';
import useWorkouts from './hooks/useWorkouts';
import WorkoutDetails from './WorkoutDetails';
import CreateWorkoutModal from './CreateWorkoutModal'; // We'll create this next

export default function WorkoutSelectorModal({ isOpen, onClose, onSelect }) {
  const { workouts, isLoading, error } = useWorkouts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredWorkouts = workouts.filter(workout =>
    workout.workoutName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Select Workout</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading workouts...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : filteredWorkouts.length === 0 ? (
            <div className="p-4 text-center space-y-4">
              <p className="text-gray-400">
                {searchTerm ? 'No matching workouts found' : 'No workouts available'}
              </p>
              {/* <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-vdot-blue hover:bg-vdot-blue-dark text-white rounded"
              >
                Create New Workout
              </button> */}
            </div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {filteredWorkouts.map(workout => (
                <li 
                  key={workout._id} 
                  className={`p-4 hover:bg-gray-700 cursor-pointer ${selectedWorkout?._id === workout._id ? 'bg-gray-700' : ''}`}
                  onClick={() => setSelectedWorkout(workout)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-white">{workout.workoutName}</span>
                    <span className="text-vdot-blue">
                      {workout.totalDistance?.toFixed(1)} km
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {workout.estimatedDuration} min
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-between">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-vdot-blue hover:text-vdot-blue-dark"
          >
            Create New Workout
          </button>
          <div className="space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedWorkout) {
                  onSelect(selectedWorkout);
                }
              }}
              disabled={!selectedWorkout}
              className={`px-4 py-2 rounded ${selectedWorkout ? 'bg-vdot-blue hover:bg-vdot-blue-dark text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
            >
              Select Workout
            </button>
          </div>
        </div>
      </div>

      {/* Create Workout Modal */}
      <CreateWorkoutModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(newWorkout) => {
          onSelect(newWorkout);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}