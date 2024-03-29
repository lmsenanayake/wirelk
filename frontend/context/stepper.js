"use client";
import { createContext, useContext, useState } from "react";

const StepperContext = createContext({})

export const StepperContextProvider = ({ children }) => {
  const [step, setStep] = useState(0);

  return (
    <StepperContext.Provider value={{ step, setStep }}>
      {children}
    </StepperContext.Provider>
  );
};

export const useStepperContext = () => useContext(StepperContext);

