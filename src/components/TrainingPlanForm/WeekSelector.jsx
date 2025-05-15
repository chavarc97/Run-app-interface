import { format, addWeeks, subWeeks, addDays } from 'date-fns';

export default function WeekSelector({ startDate, onDateChange, weekNumber, onWeekChange }) {
  const handlePrevWeek = () => {
    const newDate = subWeeks(startDate, 1);
    onDateChange(newDate);
    onWeekChange(weekNumber - 1);
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(startDate, 1);
    onDateChange(newDate);
    onWeekChange(weekNumber + 1);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
      <button
        type="button"
        onClick={handlePrevWeek}
        className="p-2 rounded-full hover:bg-gray-700"
      >
        <ChevronLeftIcon className="h-5 w-5 text-vdot-blue" />
      </button>
      
      <div className="text-center">
        <p className="text-sm text-gray-400">Week {weekNumber}</p>
        <p className="font-medium text-white">
          {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
        </p>
      </div>
      
      <button
        type="button"
        onClick={handleNextWeek}
        className="p-2 rounded-full hover:bg-gray-700"
      >
        <ChevronRightIcon className="h-5 w-5 text-vdot-blue" />
      </button>
    </div>
  );
}

function ChevronLeftIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}