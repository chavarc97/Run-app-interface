// CreateWorkoutModal.jsx
import { useState } from "react";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function CreateWorkoutModal({ isOpen, onClose, onSave }) {
  const [workoutName, setWorkoutName] = useState("");
  const [warmUp, setWarmUp] = useState({
    time: "",
    distance: { value: "", unit: "km" },
    pace: { type: "easy", pace: "" },
  });

  const [coolDown, setCoolDown] = useState({
    time: "",
    distance: { value: "", unit: "km" },
    pace: { type: "easy", pace: "" },
  });

  const [workSegments, setWorkSegments] = useState([
    {
      type: "distance",
      distance: { value: "", unit: "km" },
      time: "",
      pace: { type: "easy", pace: "" },
      repetitions: 1,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = user?.token || localStorage.getItem("token");
      const userPaces = user?.vDot?.trainingPaces || {
        easy: "06:00",
        marathon: "05:30",
        threshold: "04:30",
        interval: "04:00",
        repetition: "03:30",
      };

      // Validate pace format before submission
      const validatePace = (pace) => {
        if (!pace) return undefined;
        // Allow both mm:ss and m:ss formats
        if (!/^(\d{1,2}):[0-5][0-9]$/.test(pace)) {
          throw new Error(
            `Invalid pace format: ${pace}. Must be m:ss or mm:ss`
          );
        }
        // Format to mm:ss (pad single-digit minutes)
        const [mm, ss] = pace.split(":");
        return `${mm.padStart(2, "0")}:${ss}`;
      };

      const workoutData = {
        workoutName,
        warmUp:
          warmUp.time || warmUp.distance.value
            ? {
                ...warmUp,
                distance: warmUp.distance.value ? warmUp.distance : undefined,
                pace: warmUp.pace.pace
                  ? {
                      type: warmUp.pace.type,
                      pace: validatePace(warmUp.pace.pace),
                    }
                  : undefined,
              }
            : undefined,
        work: workSegments
          .filter((seg) => seg.time || seg.distance?.value)
          .map((seg) => {
            // Get the pace - either user input or from user's stored paces
            let paceValue;
            if (seg.pace.pace) {
              paceValue = validatePace(seg.pace.pace);
            } else {
              paceValue = validatePace(userPaces[seg.pace.type] || "06:00");
            }

            return {
              ...seg,
              distance: seg.distance?.value ? seg.distance : undefined,
              pace: {
                type: seg.pace.type,
                pace: paceValue,
              },
              splits: [],
            };
          }),
        coolDown:
          coolDown.time || coolDown.distance.value
            ? {
                ...coolDown,
                distance: coolDown.distance.value
                  ? coolDown.distance
                  : undefined,
                pace: coolDown.pace.pace
                  ? {
                      type: coolDown.pace.type,
                      pace: validatePace(coolDown.pace.pace),
                    }
                  : undefined,
              }
            : undefined,
        user: user._id,
      };

      // Remove undefined fields
      const cleanedData = JSON.parse(JSON.stringify(workoutData));

      const response = await axios.post(
        "https://web-back-4n3m.onrender.com/api/v1/training/workouts",
        cleanedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSave(response.data.data);
      onClose();
    } catch (err) {
      console.error("Error creating workout:", {
        message: err.message,
        response: err.response?.data,
      }); // More detailed error logging
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addWorkSegment = () => {
    setWorkSegments([
      ...workSegments,
      {
        type: "distance",
        distance: { value: "", unit: "km" },
        time: "",
        pace: { type: "easy", pace: "" },
        repetitions: 1,
        splits: [],
      },
    ]);
  };

  const validatePace = (pace) => {
    if (!pace) return undefined;
    // Remove any non-digit characters
    const cleaned = pace.replace(/[^\d:]/g, "");
    // Split into mm and ss
    const [mm = "00", ss = "00"] = cleaned.split(":");

    // Format minutes (00-59)
    const formattedMm = Math.min(
      59,
      parseInt(mm.padStart(2, "0").substring(0, 2))
    );
    // Format seconds (00-59)
    const formattedSs = Math.min(
      59,
      parseInt(ss.padStart(2, "0").substring(0, 2))
    );

    return `${String(formattedMm).padStart(2, "0")}:${String(
      formattedSs
    ).padStart(2, "0")}`;
  };

  const handlePaceChange = (value, setPace) => {
    // Allow only digits and colon, max length 5 (mm:ss)
    if (/^[\d:]*$/.test(value) && value.length <= 5) {
      setPace(value);
    }
  };

  const handlePaceBlur = (currentValue, setPace) => {
    if (currentValue) {
      // Format to mm:ss (e.g., "5" -> "05:00", "5:3" -> "05:30", "4:56" -> "04:56")
      const [mm = "00", ss = "00"] = currentValue.split(":");
      const formattedMm = mm.padStart(2, "0").slice(0, 2);
      const formattedSs = ss.padStart(2, "0").slice(0, 2);
      setPace(`${formattedMm}:${formattedSs}`);
    }
  };

  const removeWorkSegment = (index) => {
    const newSegments = [...workSegments];
    newSegments.splice(index, 1);
    setWorkSegments(newSegments);
  };

  const updateWorkSegment = (index, field, value) => {
    const newSegments = [...workSegments];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      newSegments[index][parent][child] = value;
    } else {
      newSegments[index][field] = value;
    }
    setWorkSegments(newSegments);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">
              Create New Workout
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {error && (
            <div className="p-2 bg-red-900 text-red-100 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Workout Name
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              required
              maxLength={25}
            />
          </div>

          {/* Warm Up Section */}
          <div className="border border-gray-700 rounded p-4">
            <h4 className="text-sm font-medium text-vdot-blue mb-3">Warm Up</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Time (mm:ss)
                </label>
                <input
                  type="text"
                  value={warmUp.time}
                  onChange={(e) =>
                    setWarmUp({ ...warmUp, time: e.target.value })
                  }
                  placeholder="00:00"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                  pattern="^([0-5][0-9]):[0-5][0-9]$"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Distance
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={warmUp.distance.value}
                    onChange={(e) =>
                      setWarmUp({
                        ...warmUp,
                        distance: { ...warmUp.distance, value: e.target.value },
                      })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded rounded-r-none"
                  />
                  <select
                    value={warmUp.distance.unit}
                    onChange={(e) =>
                      setWarmUp({
                        ...warmUp,
                        distance: { ...warmUp.distance, unit: e.target.value },
                      })
                    }
                    className="bg-gray-700 text-white px-2 rounded rounded-l-none border-l border-gray-600"
                  >
                    <option value="m">m</option>
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* pace input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Pace (mm:ss)
              </label>
              <div className="flex space-x-2">
                <select
                  value={warmUp.pace.type}
                  onChange={(e) =>
                    setWarmUp({
                      ...warmUp,
                      pace: { ...warmUp.pace, type: e.target.value },
                    })
                  }
                  className="bg-gray-700 text-white px-2 py-2 rounded"
                >
                  <option value="easy">Easy</option>
                  <option value="marathon">Marathon</option>
                  <option value="threshold">Threshold</option>
                  <option value="interval">Interval</option>
                  <option value="repetition">Repetition</option>
                </select>
                <input
                  type="text"
                  value={warmUp.pace.pace}
                  onChange={(e) =>
                    handlePaceChange(e.target.value, (val) =>
                      setWarmUp({
                        ...warmUp,
                        pace: { ...warmUp.pace, pace: val },
                      })
                    )
                  }
                  onBlur={(e) =>
                    handlePaceBlur(e.target.value, (val) =>
                      setWarmUp({
                        ...warmUp,
                        pace: { ...warmUp.pace, pace: val },
                      })
                    )
                  }
                  pattern="^(\d{1,2}):[0-5][0-9]$"
                  placeholder="05:30"
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                />
                {warmUp.pace.pace &&
                  !/^(\d{1,2}):[0-5][0-9]$/.test(warmUp.pace.pace) && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-400">
                      Must be m:ss or mm:ss (e.g., 5:30 or 05:30)
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Work Segments */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-vdot-blue">
                Work Segments
              </h4>
              <button
                type="button"
                onClick={addWorkSegment}
                className="text-sm text-vdot-blue hover:text-vdot-blue-dark"
              >
                + Add Segment
              </button>
            </div>

            {workSegments.map((segment, index) => (
              <div key={index} className="border border-gray-700 rounded p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-300">
                    Segment {index + 1}
                  </span>
                  {workSegments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWorkSegment(index)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={segment.type}
                      onChange={(e) =>
                        updateWorkSegment(index, "type", e.target.value)
                      }
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                    >
                      <option value="distance">Distance</option>
                      <option value="time">Time</option>
                    </select>
                  </div>

                  {segment.type === "distance" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Distance
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          value={segment.distance.value}
                          onChange={(e) =>
                            updateWorkSegment(
                              index,
                              "distance.value",
                              e.target.value
                            )
                          }
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded rounded-r-none"
                        />
                        <select
                          value={segment.distance.unit}
                          onChange={(e) =>
                            updateWorkSegment(
                              index,
                              "distance.unit",
                              e.target.value
                            )
                          }
                          className="bg-gray-700 text-white px-2 rounded rounded-l-none border-l border-gray-600"
                        >
                          <option value="m">m</option>
                          <option value="km">km</option>
                          <option value="mi">mi</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Time (mm:ss)
                      </label>
                      <input
                        type="text"
                        value={segment.time}
                        onChange={(e) =>
                          updateWorkSegment(index, "time", e.target.value)
                        }
                        placeholder="00:00"
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                        pattern="^([0-5][0-9]):[0-5][0-9]$"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Repetitions
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={segment.repetitions}
                      onChange={(e) =>
                        updateWorkSegment(
                          index,
                          "repetitions",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Pace (mm:ss)
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={segment.pace.type}
                        onChange={(e) =>
                          updateWorkSegment(index, "pace.type", e.target.value)
                        }
                        className="bg-gray-700 text-white px-2 py-2 rounded"
                      >
                        <option value="easy">Easy</option>
                        <option value="marathon">Marathon</option>
                        <option value="tempo">Tempo</option>
                        <option value="threshold">Threshold</option>
                        <option value="interval">Interval</option>
                        <option value="repetition">Repetition</option>
                      </select>
                      <input
                        type="text"
                        value={segment.pace.pace}
                        pattern="^(\d{1,2}):[0-5][0-9]$"
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only digits and colon, max length 5 (mm:ss)
                          if (/^[\d:]*$/.test(value) && value.length <= 5) {
                            updateWorkSegment(index, "pace.pace", value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value) {
                            // Auto-format to mm:ss
                            const [mm = "00", ss = "00"] = value.split(":");
                            const formattedMm = mm
                              .padStart(2, "0")
                              .substring(0, 2);
                            const formattedSs = ss
                              .padStart(2, "0")
                              .substring(0, 2);
                            updateWorkSegment(
                              index,
                              "pace.pace",
                              `${formattedMm}:${formattedSs}`
                            );
                          }
                        }}
                        placeholder="05:30"
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                      />
                      {segment.pace.pace &&
                        !/^(\d{1,2}):[0-5][0-9]$/.test(segment.pace.pace) && (
                          <p className="absolute -bottom-5 left-0 text-xs text-red-400">
                            Must be m:ss or mm:ss (e.g., 5:30 or 05:30)
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cool Down Section */}
          <div className="border border-gray-700 rounded p-4">
            <h4 className="text-sm font-medium text-vdot-blue mb-3">
              Cool Down
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Time (mm:ss)
                </label>
                <input
                  type="text"
                  value={coolDown.time}
                  onChange={(e) =>
                    setCoolDown({ ...coolDown, time: e.target.value })
                  }
                  placeholder="00:00"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                  pattern="^([0-5][0-9]):[0-5][0-9]$"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Distance
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={coolDown.distance.value}
                    onChange={(e) =>
                      setCoolDown({
                        ...coolDown,
                        distance: {
                          ...coolDown.distance,
                          value: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded rounded-r-none"
                  />
                  <select
                    value={coolDown.distance.unit}
                    onChange={(e) =>
                      setCoolDown({
                        ...coolDown,
                        distance: {
                          ...coolDown.distance,
                          unit: e.target.value,
                        },
                      })
                    }
                    className="bg-gray-700 text-white px-2 rounded rounded-l-none border-l border-gray-600"
                  >
                    <option value="m">m</option>
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Pace (mm:ss)
              </label>
              <div className="flex space-x-2">
                <select
                  value={coolDown.pace.type}
                  onChange={(e) =>
                    setCoolDown({
                      ...coolDown,
                      pace: { ...coolDown.pace, type: e.target.value },
                    })
                  }
                  className="bg-gray-700 text-white px-2 py-2 rounded"
                >
                  <option value="easy">Easy</option>
                  <option value="marathon">Marathon</option>
                  <option value="tempo">Tempo</option>
                  <option value="threshold">Threshold</option>
                  <option value="interval">Interval</option>
                  <option value="repetition">Repetition</option>
                </select>
                <input
                  type="text"
                  value={coolDown.pace.pace}
                  onChange={(e) =>
                    handlePaceChange(e.target.value, (val) =>
                      setCoolDown({
                        ...coolDown,
                        pace: { ...coolDown.pace, pace: val },
                      })
                    )
                  }
                  onBlur={(e) =>
                    handlePaceBlur(e.target.value, (val) =>
                      setCoolDown({
                        ...coolDown,
                        pace: { ...coolDown.pace, pace: val },
                      })
                    )
                  }
                  pattern="^(\d{1,2}):[0-5][0-9]$"
                  placeholder="05:30"
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                />
                {coolDown.pace.pace &&
                  !/^(\d{1,2}):[0-5][0-9]$/.test(coolDown.pace.pace) && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-400">
                      Must be m:ss or mm:ss (e.g., 5:30 or 05:30)
                    </p>
                  )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded ${
                isLoading
                  ? "bg-gray-700 text-gray-500"
                  : "bg-vdot-blue hover:bg-vdot-blue-dark text-white"
              }`}
            >
              {isLoading ? "Creating..." : "Create Workout"}
            </button>
          </div>
        </form>
      </div>
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
