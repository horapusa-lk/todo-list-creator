"use client";

import * as React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Todo, Priority } from "@/types/todo";
import { TodoInput } from "./todo-input";
import { TodoItem } from "./todo-item";
import { ProgressRing } from "./progress-ring";
import { FocusTimer } from "./focus-timer";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Layers, CheckSquare, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TodoApp() {
    const [todos, setTodos] = React.useState<Todo[]>([]);
    const [isMounted, setIsMounted] = React.useState(false);
    const [filter, setFilter] = React.useState<"all" | "active" | "completed">("all");
    const [search, setSearch] = React.useState("");
    const [focusTodo, setFocusTodo] = React.useState<Todo | null>(null);
    const { setTheme, theme } = useTheme();

    // On mount, load from localStorage
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem("todos");
            if (stored) {
                setTodos(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Local storage error:", e);
        }
        setIsMounted(true);
    }, []);

    // Save to localStorage whenever todos change
    React.useEffect(() => {
        if (!isMounted) return;
        try {
            localStorage.setItem("todos", JSON.stringify(todos));
        } catch (e) {
            console.error("Local storage error:", e);
        }
    }, [todos, isMounted]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        if (result.source.index === result.destination.index) return;

        // We can only reliably drag-and-drop if there is no filter or search
        // But for a simple app we usually just reorder the main list if not filtered
        // For now we reorder the raw list based on the visual indexes
        const newTodos = Array.from(todos);
        const [reorderedItem] = newTodos.splice(result.source.index, 1);
        newTodos.splice(result.destination.index, 0, reorderedItem);

        setTodos(newTodos);
    };

    const handleAdd = (title: string, priority: Priority, tags: string[], reminder: Date | null) => {
        const newTodo: Todo = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
            title,
            priority,
            tags,
            reminder,
            completed: false,
            createdAt: new Date(),
        };
        setTodos((prev) => [newTodo, ...prev]);
    };

    const handleToggle = (id: string, completed: boolean) => {
        setTodos((prev) =>
            prev.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
        );
        if (completed) {
            toast("Task completed", { icon: "🎉" });
        }
    };

    const handleDelete = (id: string) => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
        toast("Task deleted from list", { icon: <Trash2 className="h-4 w-4" /> });
    };

    const handleFocus = (todo: Todo) => {
        setFocusTodo(todo);
    };

    const filteredTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    }).filter((todo) => todo.title.toLowerCase().includes(search.toLowerCase()));

    // Stats
    const completedCount = todos.filter((t) => t.completed).length;
    const progressPercentage = todos.length === 0 ? 0 : (completedCount / todos.length) * 100;

    if (!isMounted) return <div className="min-h-screen bg-background" />; // Hydration skeleton

    return (
        <div className="container mx-auto max-w-6xl p-4 md:p-8 min-h-screen flex flex-col pt-8">
            <header className="flex items-center justify-between mb-8 w-full">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                        <CheckSquare className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                        Task Master
                    </h1>
                    <p className="text-muted-foreground mt-2 hidden md:block">
                        Organize your life, achieve your goals.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full"
                    >
                        <Sun className="h-5 w-5 dark:hidden" />
                        <Moon className="h-5 w-5 hidden dark:block" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 flex-1">
                {/* Left Column / Sidebar */}
                <div className="flex flex-col gap-6 lg:w-1/3">
                    {/* Progress Card */}
                    <div className="bg-card rounded-2xl p-6 border shadow-sm flex flex-col items-center justify-center text-center">
                        <h2 className="text-lg font-semibold mb-4 w-full text-left">Daily Progress</h2>
                        <ProgressRing percentage={progressPercentage} size={160} />
                        <p className="text-sm text-muted-foreground mt-4">
                            {completedCount} of {todos.length} tasks completed
                        </p>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Filters & Search</h2>

                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                className="pl-9 bg-background"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant={filter === "all" ? "default" : "ghost"}
                                className={`justify-start ${filter === "all" ? "" : "opacity-70 hover:opacity-100"}`}
                                onClick={() => setFilter("all")}
                            >
                                <Layers className="h-4 w-4 mr-2" /> All Tasks
                            </Button>
                            <Button
                                variant={filter === "active" ? "secondary" : "ghost"}
                                className={`justify-start ${filter === "active" ? "" : "opacity-70 hover:opacity-100 text-blue-500"}`}
                                onClick={() => setFilter("active")}
                            >
                                <span className="h-2 w-2 rounded-full bg-blue-500 mr-4 ml-1"></span> Active
                            </Button>
                            <Button
                                variant={filter === "completed" ? "secondary" : "ghost"}
                                className={`justify-start ${filter === "completed" ? "" : "opacity-70 hover:opacity-100 text-green-500"}`}
                                onClick={() => setFilter("completed")}
                            >
                                <span className="h-2 w-2 rounded-full bg-green-500 mr-4 ml-1"></span> Completed
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column / Main */}
                <div className="flex flex-col gap-6 lg:w-2/3 h-full pb-20 lg:pb-0">
                    <TodoInput onAdd={handleAdd} />

                    <div className="flex items-center justify-between mt-2">
                        <h2 className="text-xl font-bold tracking-tight">Your Tasks</h2>

                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                                Options
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                    setTodos(todos.filter(t => !t.completed));
                                    toast("Cleared completed tasks");
                                }}>
                                    Clear completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    if (confirm("Are you sure you want to delete all tasks?")) {
                                        setTodos([]);
                                        toast("All tasks deleted");
                                    }
                                }}>
                                    Clear all
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <ScrollArea className="flex-1 -mx-4 px-4 h-[500px] lg:h-auto overflow-y-auto">
                        {filteredTodos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full border-2 border-dashed rounded-xl opacity-60 bg-muted/20">
                                <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">No tasks found</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    {search ? "No matching tasks for your search." : "You're all caught up! Add a new task above to get started."}
                                </p>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="todo-list">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="min-h-full"
                                        >
                                            {filteredTodos.map((todo, index) => (
                                                <Draggable key={todo.id} draggableId={todo.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <TodoItem
                                                            todo={todo}
                                                            provided={provided}
                                                            snapshot={snapshot}
                                                            onToggle={handleToggle}
                                                            onDelete={handleDelete}
                                                            onFocusStart={handleFocus}
                                                        />
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </ScrollArea>
                </div>
            </div>

            <FocusTimer todo={focusTodo} onClose={() => setFocusTodo(null)} />
        </div>
    );
}
