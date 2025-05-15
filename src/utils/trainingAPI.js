import axios from 'axios';

const API_URL = 'https://web-back-4n3m.onrender.com/api/v1/training';

// Set up axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Workout API functions
export const workoutApi = {
  // Create a new workout
  createWorkout: async (workoutData) => {
    try {
      const response = await api.post('/workouts', workoutData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all workouts for a user
  getAllWorkouts: async (userId) => {
    try {
      const response = await api.get(`/workouts/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single workout by ID
  getWorkoutById: async (workoutId, userId) => {
    try {
      const response = await api.get(`/workouts/${workoutId}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a workout
  updateWorkout: async (workoutId, userId, updateData) => {
    try {
      const response = await api.put(`/workouts/${workoutId}/${userId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a workout
  deleteWorkout: async (workoutId, userId) => {
    try {
      const response = await api.delete(`/workouts/${workoutId}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Training Plan API functions
export const trainingPlanApi = {
  // Get weekly summary for a user
  getWeeklySummary: async (userId) => {
    try {
      const response = await api.get(`/summary/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new training plan
  createTrainingPlan: async (planData) => {
    try {
      const response = await api.post('/plan', planData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all training plans for a user
  getTrainingPlans: async (userId) => {
    try {
      const response = await api.get(`/plan/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single training plan by ID
  getTrainingPlanById: async (planId, userId) => {
    try {
      const response = await api.get(`/plan/${planId}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a training plan
  updateTrainingPlan: async (planId, userId, updateData) => {
    try {
      const response = await api.put(`/plan/${planId}/${userId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a training plan
  deleteTrainingPlan: async (planId, userId) => {
    try {
      const response = await api.delete(`/plan/${planId}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark a workout as complete in a training plan
  completeWorkout: async (userId, { planId, workoutId, actualDistance, notes }) => {
    try {
      const response = await api.put(`/complete/${userId}`, {
        planId,
        workoutId,
        actualDistance,
        notes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};