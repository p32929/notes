import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { controller } from "@/lib/StatesController";
import { useSelector } from "react-redux";
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useEffect } from "react";
import React from "react";
import { getData, saveData } from "@/lib/utils";

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout); // Clear the previous timeout
    timeout = setTimeout(() => {
      func(...args); // Execute the function after delay
    }, delay);
  } as T;
}

function App() {
  const states = useSelector(() => controller.states); // Access state using useSelector
  const debouncedUpdateData = React.useMemo(() => debounce(saveData, 1000), []);

  useEffect(() => {
    debouncedUpdateData()
  }, [states])

  useEffect(() => {
    getData()
  }, [])

  return (
    <div className='flex flex-col w-screen h-screen'>
      <div className='flex flex-row p-5 gap-x-2'>
        <a href="/">
          <h3 className="text-2xl font-semibold tracking-tight">
            9Notes
          </h3>
        </a>

        <div className="flex-1" />

        <Button disabled={states.tabs.length === 1} variant="outline" size="icon" onClick={() => {
          controller.deleteTab()
        }}>
          <TrashIcon className="h-4 w-4" />
        </Button>

        <Select
          value={states.selectedTab.toString()}
          onValueChange={(v) => {
            controller.setStates({
              selectedTab: parseInt(v)
            });
          }}
        >
          <SelectTrigger className="w-min px-4">
            <SelectValue placeholder="Select a tab" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {states.tabs.map((_item, index) => (
                <SelectItem value={index.toString()} key={index}>
                  {`Tab ${index + 1}`}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={() => {
          controller.addTab()
        }}>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="p-3 w-full h-full">
        <Textarea
          placeholder={`Write anything here. Everything gets autosaved offline. Cick on the + icon to add more tabs. Enjoy...`}
          className="w-full h-full"
          value={states.tabs[states.selectedTab]} // Use local state
          onChange={(e) => {
            controller.setText(e.target.value)
          }}
        />
      </div>
    </div>
  );
}

export default App;
