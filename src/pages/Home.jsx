import { Link } from "react-router-dom";
import TrainingCalendar from "../components/TrainingCalendar";
import React, { useState, useEffect } from 'react';
import useAuthStore from "../store/authStore";

const Home = () => {
  const { user } = useAuthStore();
  return (
    <>
      <div className=" m-10  border-b-2 border-zinc-400/30 pb-4 flex flex-col items-center">
        <Link
          to="/profile"
          className="w-50 h-50 rounded-full bg-neutral-400 items-center flex justify-center"
        >
          <img
            className="w-48 h-48 rounded-full"
            src={user?.avatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
            alt=""
          />
        </Link>
        <h1 className="text-4xl font-bold text-start text-neutral-50 mt-10">
          Welcome to Run-App
        </h1>
        <p className="text-start text-neutral-50 mt-2">
          Your personal running calendar
        </p>
      </div>
      <TrainingCalendar
      />
    </>
  );
};
export default Home;
