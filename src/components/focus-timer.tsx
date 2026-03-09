import * as React from "react";
import { Todo } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface FocusTimerProps {
    todo: Todo | null;
    onClose: () => void;
}

export function FocusTimer({ todo, onClose }: FocusTimerProps) {
    const [timeLeft, setTimeLeft] = React.useState(25 * 60); // 25 minutes pomodoro
    const [isRunning, setIsRunning] = React.useState(false);

    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            // Optional: Trigger a sound or notification here
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    React.useEffect(() => {
        // Reset timer when a new todo is selected
        setTimeLeft(25 * 60);
        setIsRunning(false);
    }, [todo]);

    if (!todo) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

    return (
        <Dialog open={!!todo} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Focus Mode</DialogTitle>
                    <DialogDescription>
                        Working on: <span className="font-semibold text-foreground">{todo.title}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative flex items-center justify-center w-64 h-64 mb-8">
                        <svg width="256" height="256" className="rotate-[-90deg]">
                            <circle
                                className="text-muted/20"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="120"
                                cx="128"
                                cy="128"
                            />
                            <circle
                                className="text-primary transition-all duration-1000"
                                strokeWidth="8"
                                strokeDasharray={120 * 2 * Math.PI}
                                strokeDashoffset={120 * 2 * Math.PI - (progress / 100) * (120 * 2 * Math.PI)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="120"
                                cx="128"
                                cy="128"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-6xl font-black font-mono tabular-nums">
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-12 w-12 rounded-full"
                            onClick={() => {
                                setIsRunning(false);
                                setTimeLeft(25 * 60);
                            }}
                        >
                            <RotateCcw className="h-5 w-5" />
                            <span className="sr-only">Reset</span>
                        </Button>

                        <Button
                            size="icon"
                            className="h-16 w-16 rounded-full"
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                            <span className="sr-only">{isRunning ? "Pause" : "Start"}</span>
                        </Button>

                        <Button
                            size="icon"
                            variant="outline"
                            className="h-12 w-12 rounded-full"
                            onClick={onClose}
                        >
                            <Square className="h-5 w-5" />
                            <span className="sr-only">Stop</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
