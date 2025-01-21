import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Settings } from "lucide-react";

export function SettingsDialog() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [open, setOpen] = useState(false);

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setOpen(false); // Close the dialog after saving
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent"
          title="Settings"
        >
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Enter your Gemini API key to use the search functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="apiKey">Gemini API Key</label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveApiKey();
                }
              }}
            />
          </div>
          <Button onClick={handleSaveApiKey}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
