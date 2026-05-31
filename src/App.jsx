import React, { useState } from "react";
import RegistrationForm from "./components/RegistrationForm";
import EventScheduler from "./components/EventScheduler";

export default function App() {
  const [step, setStep] = useState("register"); // 'register' or 'schedule'
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleRegisterSuccess = (user) => {
    setRegisteredUser(user);
    setStep("schedule");
  };

  const handleBack = () => {
    setRegisteredUser(null);
    setStep("register");
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-black text-white transition-colors duration-500">
      
      <div className="flex flex-col items-center w-full max-w-6xl p-4 my-8">
        
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] text-center">
          {step === "register" ? "Full Form with DFA/FSM Validation" : "Cyber Event Scheduler"}
        </h1>

        <div className="w-full max-w-4xl">
          {step === "register" ? (
            <RegistrationForm onRegisterSuccess={handleRegisterSuccess} />
          ) : (
            <EventScheduler user={registeredUser} onBack={handleBack} />
          )}
        </div>

      </div>

    </div>
  );
}
