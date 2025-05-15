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
      
      // Prepare workouts with minimal required data
      const processedWorkouts = planData.workouts.map(workout => ({
        day: workout.day,
        workout: workout.workout,
        comment: workout.comment || [" "], // Ensure non-empty comment
        // Don't include work segments here - they'll be populated by the server
      }));

      // Prepare final payload
      const payload = {
        ...planData,
        date: new Date(planData.date).toISOString(),
        workouts: processedWorkouts,
        user: user._id,
      };

      console.log("Submitting training plan:", payload);

      const response = await axios.post(
        "https://web-back-4n3m.onrender.com/api/v1/training/plan",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating plan:", {
        message: error.message,
        response: error.response?.data,
      });
      setError(error.response?.data?.message || error.message);
      throw error;
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
  
