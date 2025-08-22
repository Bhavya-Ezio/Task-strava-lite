"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ActiveTabContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const ActiveTabContext = createContext<ActiveTabContextType | undefined>(undefined);

export function ActiveTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
}

export function useActiveTab() {
  const context = useContext(ActiveTabContext);
  if (context === undefined) {
    throw new Error("useActiveTab must be used within an ActiveTabProvider");
  }
  return context;
}
