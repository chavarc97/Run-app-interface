import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import AddRecentRace from "./pages/AddRecentRace";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the ProtectedRoute component
import useAuthStore from "./store/authStore"; // Import the auth store
import { Navigate } from "react-router-dom";
import AddUpcomingRace from "./pages/AddUpcomingRace";
import UserSetup from "./pages/UserSetup";
import TrainingPlanForm from "./pages/CreateTrainingPlan";

function App() {
  return (
    <Router>
      <div className="app-container">
        {" "}
        {/* Add a wrapper div */}
        <Header />
        <main>
          {" "}
          {/* Consider adding a main element for better structure */}
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/addActivity" element={<TrainingPlanForm />} />
              <Route path="/addRecentRace" element={<AddRecentRace />} />
              <Route path="/addUpcomingRace" element={<AddUpcomingRace />} />
              <Route path="/userSetUp" element={<UserSetup/>}/>
            </Route>
            {/* Redirect to signin by default */}
            <Route path="/*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
