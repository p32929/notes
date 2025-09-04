import { controller } from "@/lib/StatesController";
import { useSelector } from "react-redux";
import { useEffect, useCallback, useState } from "react";
import React from "react";
import { getData, saveData } from "@/lib/utils";
import NotesPanel from "@/components/NotesPanel";
import EditorPanel from "@/components/EditorPanel";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    debouncedUpdateData()
  }, [states, debouncedUpdateData])

  useEffect(() => {
    getData()
  }, [])

  // Close mobile menu when a note is selected
  useEffect(() => {
    if (states.selectedNoteId) {
      setIsMobileMenuOpen(false);
    }
  }, [states.selectedNoteId]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Notes Panel - Hidden on mobile unless menu is open */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        transition-transform duration-300 ease-in-out
        fixed md:relative
        z-40
        w-80 md:w-80 lg:w-96
        h-full
        bg-background
        border-r border-border
      `}>
        <NotesPanel />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Editor Panel - Takes full width on mobile, flexible on desktop */}
      <div className="flex-1 min-w-0">
        <EditorPanel />
      </div>
    </div>
  );
}

export default App;