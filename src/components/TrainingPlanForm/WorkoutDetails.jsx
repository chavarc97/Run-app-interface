export default function WorkoutDetails({ workout }) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <h4 className="font-medium text-white">{workout.workoutName}</h4>
          <span className="text-vdot-blue">
            {workout.totalDistance?.toFixed(1)} km
          </span>
        </div>
        
        {workout.warmUp && (
          <div className="text-sm text-gray-400">
            <span className="font-medium">Warm Up:</span> {workout.warmUp.distance} km
          </div>
        )}
        
        {workout.work?.length > 0 && (
          <div className="text-sm text-gray-400">
            <span className="font-medium">Work:</span> {workout.work.length} sets
          </div>
        )}
        
        {workout.coolDown && (
          <div className="text-sm text-gray-400">
            <span className="font-medium">Cool Down:</span> {workout.coolDown.distance} km
          </div>
        )}
      </div>
    );
  }