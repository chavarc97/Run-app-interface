import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

export default function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  
  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = user?.token || localStorage.getItem('token');
        const response = await axios.get(
          `https://web-back-4n3m.onrender.com/api/v1/training/workouts/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        setWorkouts(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkouts();
  }, [user]);
  
  return {
    workouts,
    isLoading,
    error,
  };
}