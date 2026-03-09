import * as React from "react";
import * as chrono from "chrono-node";
import { format } from "date-fns";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Priority } from "@/types/todo";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TodoInputProps {
    onAdd: (
        title: string,
        priority: Priority,
        tags: string[],
        reminder: Date | null
    ) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
    const [inputVal, setInputVal] = React.useState("");
    const [priority, setPriority] = React.useState<Priority>("Medium");
    const [tags, setTags] = React.useState<string[]>([]);

    // NLP extraction logic
    const handleExtract = (text: string) => {
        const results = chrono.parse(text);
        if (!results || results.length === 0) return { title: text, date: null };

        // Simply take the first date match
        const result = results[0];
        const extractedDate = result.start.date();
        const cleanTitle = text.replace(result.text, "").trim();

        return { title: cleanTitle, date: extractedDate };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputVal.trim()) return;

        const { title, date } = handleExtract(inputVal);

        if (date) {
            toast.success(`Reminder set for ${format(date, "MMM d, yyyy h:mm a")}`);
        } else {
            toast.success("Task added successfully");
        }

        onAdd(title || inputVal, priority, tags, date);
        // Reset state
        setInputVal("");
        setTags([]);
        setPriority("Medium");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 bg-card rounded-lg shadow-sm w-full border border-border">
            <div className="flex gap-2">
                <Input
                    placeholder='e.g., "Buy milk tomorrow at 10am" (Try natural language!)'
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="flex-1 bg-background text-base"
                />
                <Button type="submit" size="icon" disabled={!inputVal.trim()}>
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add task</span>
                </Button>
            </div>

            <div className="flex items-center gap-4 mt-2 justify-between flex-wrap">
                <div className="flex items-center gap-2">
                    {tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))}>
                            {tag} <span className="text-xs">&times;</span>
                        </Badge>
                    ))}
                    <Badge
                        variant="outline"
                        className="cursor-pointer border-dashed gap-1"
                        onClick={() => {
                            const tag = window.prompt("Enter tag name:");
                            if (tag && tag.trim() && !tags.includes(tag.trim())) {
                                setTags([...tags, tag.trim()]);
                            }
                        }}
                    >
                        <Tag className="h-3 w-3" /> Add tag
                    </Badge>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground mr-1">Priority:</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8" />}>
                            {priority}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPriority("Low")}>Low</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPriority("Medium")}>Medium</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPriority("High")}>High</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </form>
    );
}
