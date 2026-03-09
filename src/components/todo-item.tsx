import * as React from "react";
import { Todo } from "@/types/todo";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Clock, Target } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface TodoItemProps {
    todo: Todo;
    provided: any; // DraggableProvided from @hello-pangea/dnd
    snapshot: any; // DraggableStateSnapshot
    onToggle: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    onFocusStart: (todo: Todo) => void;
}

export function TodoItem({ todo, provided, snapshot, onToggle, onDelete, onFocusStart }: TodoItemProps) {
    const priorityColors = {
        Low: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
        Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
        High: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    };

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
        group flex items-center justify-between gap-3 p-4 mb-3 rounded-xl border bg-card shadow-sm transition-all duration-200
        ${snapshot.isDragging ? "opacity-90 scale-[1.02] shadow-xl z-50 border-primary cursor-grabbing" : "hover:border-primary/50"}
        ${todo.completed ? "opacity-60 bg-muted/30" : ""}
      `}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                    {...provided.dragHandleProps}
                    className={`cursor-grab flex-shrink-0 text-muted-foreground/40 transition-colors ${snapshot.isDragging ? 'cursor-grabbing' : 'hover:text-foreground'}`}
                >
                    <GripVertical className="h-5 w-5" />
                </div>

                <Checkbox
                    checked={todo.completed}
                    onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
                    id={`todo-${todo.id}`}
                    className="h-6 w-6 rounded-full data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />

                <div className="flex flex-col flex-1 pl-1 min-w-0">
                    <label
                        htmlFor={`todo-${todo.id}`}
                        className={`font-medium text-lg leading-none cursor-pointer truncate transition-all ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                    >
                        {todo.title}
                    </label>

                    <div className="flex items-center gap-2 mt-2 max-w-full overflow-hidden flex-wrap">
                        <Badge variant="secondary" className={`${priorityColors[todo.priority]} font-medium border-0 px-2 py-0.5 text-xs`}>
                            {todo.priority}
                        </Badge>

                        {todo.reminder && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <div role="button" className="flex items-center text-xs ml-1 text-muted-foreground gap-1 bg-secondary px-2 py-0.5 rounded-full whitespace-nowrap cursor-help">
                                        <Clock className="w-3 h-3" />
                                        <span>{format(new Date(todo.reminder), "MMM d, h:mm a")}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Reminder set</TooltipContent>
                            </Tooltip>
                        )}

                        {todo.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="px-2 py-0.5 text-xs bg-muted/40 font-normal">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 focus-within:opacity-100">
                <Tooltip>
                    <TooltipTrigger render={<Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-full"
                        onClick={() => onFocusStart(todo)}
                    />}>
                        <Target className="h-4 w-4" />
                        <span className="sr-only">Focus Mode</span>
                    </TooltipTrigger>
                    <TooltipContent>Start Focus Session</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger render={<Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => onDelete(todo.id)}
                    />}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </TooltipTrigger>
                    <TooltipContent>Delete task</TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
