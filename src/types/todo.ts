export type Priority = "Low" | "Medium" | "High";

export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    priority: Priority;
    tags: string[];
    reminder?: Date | null;
    createdAt: Date;
}
