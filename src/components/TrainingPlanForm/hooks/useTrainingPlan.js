import { useState } from "react";
import axios from "axios";
import useAuthStore from "../../../store/authStore";

export default function useTrainingPlan() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  const createPlan = async (planData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = user?.token || localStorage.getItem("token");
      // Ensure workouts have valid pace data from user's stored paces
    const processedWorkouts = await Promise.all(planData.workouts.map(async (workout) => {
      // Get the workout details to check if it needs pace data
      const workoutDetails = await axios.get(
        `https://web-back-4n3m.onrender.com/api/v1/training/workouts/${workout.workout}/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If workout has pace requirements but no pace defined, use user's stored paces
      if (workoutDetails.data.data.work?.some(seg => seg.pace?.type) && !workoutDetails.data.data.work?.some(seg => seg.pace?.pace)) {
        const userData = await axios.get(
          `https://web-back-4n3m.onrender.com/api/v1/users/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userPaces = userData.data.data.vDot.trainingPaces;
        
        // Update workout with user's paces
        const updatedWork = workoutDetails.data.data.work.map(seg => {
          if (seg.pace?.type && !seg.pace.pace) {
            return {
              ...seg,
              pace: {
                type: seg.pace.type,
                pace: userPaces[seg.pace.type] || '06:00' // default fallback
              }
            };
          }
          return seg;
        });

        return {
          ...workout,
          comment: [' '], // Non-empty comment
          work: updatedWork
        };
      }

      return {
        ...workout,
        comment: [' '] // Non-empty comment
      };
    }));

    const response = await axios.post(
      'https://web-back-4n3m.onrender.com/api/v1/training/plan',
      {
        ...planData,
        workouts: processedWorkouts,
        user: user._id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
    } catch (err) {
      console.error("Error creating plan:", err.response?.data); // More detailed error logging
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPlan,
    isLoading,
    error,
  };
}
