import TodoApp from "@/components/todo-app";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <TodoApp />
    </main>
  );
}
