import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "axios";

const TrainingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [trainings, setTrainings] = useState({});
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const { user } = useAuthStore();
  const userId = user?._id || localStorage.getItem("userId");

  const workoutTypeColors = {
    "Easy Run": "bg-purple-500",
    "Long Run": "bg-green-500",
    "Track Session": "bg-blue-500",
    "Quality Session": "bg-yellow-500",
    "Garmin Training": "bg-gray-500",
    "Day Off": "bg-orange-500",
    "Recuperación activa": "bg-indigo-500",
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        setLoading(true);
        
        // Fetch training plans for the current month
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        
        const response = await axios.get(
          `https://web-back-4n3m.onrender.com/api/v1/training/plan/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            }
          }
        );

        // Process the training plans into a format we can use
        const processedTrainings = {};
        const weeklyStatsData = [];
        
        if (response.data && response.data.data) {
          response.data.data.forEach(plan => {
            plan.workouts.forEach(workout => {
              if (workout.workout) {
                const date = new Date(plan.date);
                date.setDate(date.getDate() + getDayOffset(workout.day));
                
                const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                
                processedTrainings[dateKey] = {
                  workoutType: workout.workout.workoutName,
                  details: formatWorkoutDetails(workout.workout),
                  completed: workout.completed,
                  actualDistance: workout.actualDistance
                };
              }
            });
            
            // Calculate weekly stats
            weeklyStatsData.push({
              completed: plan.completedDistance || 0,
              planned: plan.totalDistance || 0
            });
          });
        }
        
        setTrainings(processedTrainings);
        setWeeklyStats(weeklyStatsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching training data:", err);
      }
    };

    fetchTrainingData();
  }, [userId, token, currentMonth, currentYear]);

  const getDayOffset = (dayName) => {
    const dayMap = {
      "Monday": 0,
      "Tuesday": 1,
      "Wednesday": 2,
      "Thursday": 3,
      "Friday": 4,
      "Saturday": 5,
      "Sunday": 6
    };
    return dayMap[dayName] || 0;
  };

  const formatWorkoutDetails = (workout) => {
    if (workout.workoutName === "Day Off") return "Rest day";
    
    let details = "";
    if (workout.warmUp) {
      details += `Warmup: ${workout.warmUp.time || workout.warmUp.distance} `;
    }
    
    if (workout.work && workout.work.length > 0) {
      workout.work.forEach((item, index) => {
        if (index > 0) details += " + ";
        details += `${item.repetitions || 1}x${item.distance || item.time}`;
      });
    }
    
    if (workout.coolDown) {
      details += ` + Cooldown: ${workout.coolDown.time || workout.coolDown.distance}`;
    }
    
    return details || "Workout details";
  };

  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Monday start
    const daysInMonth = lastDayOfMonth.getDate();
    
    const calendarDays = [];
    let currentWeek = [];
    
    // Add days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      currentWeek.push({
        day: prevMonthLastDay - i,
        month: currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push({
        day,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true
      });
      
      if (currentWeek.length === 7) {
        calendarDays.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Add days from next month
    if (currentWeek.length > 0) {
      const daysNeeded = 7 - currentWeek.length;
      for (let day = 1; day <= daysNeeded; day++) {
        currentWeek.push({
          day,
          month: currentMonth + 1,
          year: currentMonth === 11 ? currentYear + 1 : currentYear,
          isCurrentMonth: false
        });
      }
      calendarDays.push(currentWeek);
    }
    
    return calendarDays;
  };

  const calendarDays = generateCalendarDays();

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(year => year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(year => year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const getTrainingsForDate = (day) => {
    const dateString = `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
    return trainings[dateString] ? [trainings[dateString]] : [];
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day.day === today.getDate() &&
      day.month === today.getMonth() &&
      day.year === today.getFullYear()
    );
  };

  const TrainingItem = ({ training }) => {
    const colorClass = workoutTypeColors[training.workoutType] || "bg-gray-500";

    return (
      <div className={`${colorClass} rounded-lg p-2 mb-1 text-xs`}>
        <div className="font-medium">{training.workoutType}</div>
        {training.details && (
          <div className="text-xs opacity-80">{training.details}</div>
        )}
        {training.completed && (
          <div className="text-xs mt-1">✓ Completed</div>
        )}
      </div>
    );
  };

  if (loading) return <div className="text-center py-8">Loading calendar...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-zinc-900/50 text-gray-200 min-h-screen p-8 mx-30 rounded-xl shadow-lg">
      <div className="max-w-6xl mx-auto">
        {/* Calendar header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-zinc-700"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center">
            <span className="text-xl font-semibold">
              {months[currentMonth]}
            </span>
            <span className="text-sm text-gray-400 ml-2">{currentYear}</span>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-zinc-700"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
            <div key={day} className="text-center text-gray-400 font-medium">{day}</div>
          ))}
          <div className="col-span-7 text-right text-gray-400 font-medium pr-4">
            Total
          </div>
        </div>

        {/* Calendar weeks */}
        {calendarDays.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="mb-4 relative">
            <div className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                const trainingsForDay = getTrainingsForDate(day);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={`day-${day.day}-${day.month}`}
                    className={`
                      ${day.isCurrentMonth ? "bg-zinc-800" : "bg-zinc-900 text-zinc-500"} 
                      ${isCurrentDay ? "border-2 border-blue-500" : ""} 
                      rounded-lg p-2 min-h-32 relative
                    `}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`${isCurrentDay ? "text-blue-500 font-bold" : ""}`}>
                        {day.day}
                      </span>
                      {isCurrentDay && (
                        <span className="text-xs font-medium text-blue-500">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-28">
                      {trainingsForDay.map((training, idx) => (
                        <TrainingItem key={`training-${idx}`} training={training} />
                      ))}
                    </div>
                    
                    {day.isCurrentMonth && (
                      <Link 
                        to="/addActivity" 
                        state={{ selectedDate: new Date(day.year, day.month, day.day) }}
                        className="block text-xs text-center text-gray-400 hover:bg-gray-500/30 p-2 rounded-md mt-1"
                      >
                        Add activity
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Weekly stats */}
            <div className="bg-zinc-800 rounded-lg p-2 min-h-20 flex items-center justify-end mt-2">
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold">
                  {weeklyStats[weekIndex]?.completed.toFixed(1) || "0.0"}km
                </div>
                <div className="text-sm text-gray-400">completed</div>
                <div className="text-xs text-gray-500 mt-1">
                  of {weeklyStats[weekIndex]?.planned.toFixed(1) || "0.0"}km
                </div>
              </div>
              <div className="ml-4">
                <div className="w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center relative">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-blue-500"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
                      opacity: 0.7,
                    }}
                  ></div>
                  <BarChart3 size={24} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingCalendar;