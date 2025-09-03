import { controller } from "@/lib/StatesController";
import { useSelector } from "react-redux";
import { useEffect, useCallback } from "react";
import React from "react";
import { getData, saveData } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import NotesPanel from "@/components/NotesPanel";
import EditorPanel from "@/components/EditorPanel";

function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number): T {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  } as T;
}

function App() {
  const states = useSelector(() => controller.states);
  const debouncedUpdateData = useCallback(() => debounce(saveData, 1000)(), []);

  useEffect(() => {
    debouncedUpdateData()
  }, [states, debouncedUpdateData])

  useEffect(() => {
    getData()
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <NotesPanel />
      <EditorPanel />
    </div>
  );
}

export default App;