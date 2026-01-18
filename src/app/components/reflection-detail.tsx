import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ArrowLeft, Sparkles, Calendar, Mic, FileText, CheckCircle2, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Reflection } from "./journal-list";

interface ReflectionDetailProps {
  reflection: Reflection;
  onBack: () => void;
  onSaveActions: (reflectionId: string, actions: string[]) => void;
}

export function ReflectionDetail({ reflection, onBack, onSaveActions }: ReflectionDetailProps) {
  const [suggestedTodos, setSuggestedTodos] = useState<string[]>(
    reflection.todos.length > 0
      ? reflection.todos
      : generateTodos(reflection.content)
  );
  const [selectedTodos, setSelectedTodos] = useState<string[]>(
    reflection.selectedActions || []
  );
  const [showTodos, setShowTodos] = useState(!reflection.selectedActions || reflection.selectedActions.length === 0);

  function generateTodos(content: string): string[] {
    // Simple keyword-based todo generation
    const todos: string[] = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes("study") || lowerContent.includes("review")) {
      todos.push("Create a weekly study schedule with specific time blocks");
    }
    if (lowerContent.includes("time management") || lowerContent.includes("overwhelm")) {
      todos.push("Set up time blocking for focused work sessions");
    }
    if (lowerContent.includes("project")) {
      todos.push("Break down project into smaller milestones with deadlines");
    }
    if (lowerContent.includes("struggling") || lowerContent.includes("difficult")) {
      todos.push("Attend office hours or tutoring for extra help");
    }
    if (lowerContent.includes("exam") || lowerContent.includes("midterm")) {
      todos.push("Create practice problems and review sessions for exams");
    }
    if (lowerContent.includes("group") || lowerContent.includes("classmate")) {
      todos.push("Form or join a study group with classmates");
    }
    if (lowerContent.includes("stress") || lowerContent.includes("anxious")) {
      todos.push("Schedule self-care breaks and mindfulness activities");
    }
    if (lowerContent.includes("concept") || lowerContent.includes("understand")) {
      todos.push("Create visual notes or diagrams for complex concepts");
    }
    if (lowerContent.includes("health") || lowerContent.includes("exercise")) {
      todos.push("Add 20-30 minutes of physical activity to daily routine");
    }
    if (lowerContent.includes("communication") || lowerContent.includes("team")) {
      todos.push("Schedule regular team check-ins and status updates");
    }
    
    // Default suggestions if nothing matched
    if (todos.length === 0) {
      todos.push(
        "Review and organize notes from recent classes",
        "Set specific, measurable goals for next week",
        "Reach out to a professor or TA for guidance",
        "Create a prioritized task list for upcoming assignments"
      );
    }

    return todos.slice(0, 5); // Limit to 5 suggestions
  }

  const toggleTodo = (todo: string) => {
    if (selectedTodos.includes(todo)) {
      setSelectedTodos(selectedTodos.filter(t => t !== todo));
    } else {
      setSelectedTodos([...selectedTodos, todo]);
    }
  };

  const handleSaveActions = () => {
    if (selectedTodos.length > 0) {
      onSaveActions(reflection.id, selectedTodos);
      setShowTodos(false);
      toast.success(`${selectedTodos.length} action${selectedTodos.length > 1 ? 's' : ''} saved!`);
    } else {
      toast.error("Please select at least one action");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="rounded-full hover:bg-purple-100"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className={`p-2 rounded-xl ${
            reflection.type === "audio" ? "bg-purple-100" : "bg-blue-100"
          }`}>
            {reflection.type === "audio" ? (
              <Mic className="size-4 text-purple-600" />
            ) : (
              <FileText className="size-4 text-blue-600" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="size-3.5" />
            {format(reflection.date, "MMM d, yyyy 'at' h:mm a")}
          </div>
        </div>
      </div>

      <Card className="p-6 border-2 bg-white shadow-sm">
        <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="size-5 text-purple-600" />
          Your Reflection
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {reflection.content}
        </p>
      </Card>

      <div className="pt-2">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
            <Sparkles className="size-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-xl text-gray-800">AI-Suggested Actions</h3>
        </div>

        {!showTodos && selectedTodos.length > 0 ? (
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 shadow-sm">
            <div className="mb-5">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-purple-600" />
                Your Actions to Follow Up ({selectedTodos.length})
              </h4>
              <div className="space-y-2">
                {selectedTodos.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
                    <CheckCircle2 className="size-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 flex-1">{action}</p>
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowTodos(true)}
              className="w-full border-2 border-purple-200 hover:bg-purple-50 rounded-xl h-11 font-medium"
            >
              Modify Actions
            </Button>
          </Card>
        ) : (
          <>
            <p className="text-gray-600 mb-5 flex items-start gap-2">
              <Lightbulb className="size-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>Based on your reflection, here are some personalized actions. Select the ones you want to follow up on:</span>
            </p>

            <div className="space-y-3 mb-5">
              {suggestedTodos.map((todo, index) => (
                <Card
                  key={index}
                  className={`p-5 cursor-pointer transition-all duration-200 border-2 ${
                    selectedTodos.includes(todo)
                      ? "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 shadow-md"
                      : "bg-white hover:bg-purple-50/50 hover:border-purple-200 hover:shadow-sm"
                  }`}
                  onClick={() => toggleTodo(todo)}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedTodos.includes(todo)}
                      className="mt-1 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <p className="text-gray-700 leading-relaxed flex-1 font-medium">{todo}</p>
                  </div>
                </Card>
              ))}
            </div>

            {selectedTodos.length > 0 && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 font-medium text-center">
                  {selectedTodos.length} action{selectedTodos.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            <Button
              onClick={handleSaveActions}
              disabled={selectedTodos.length === 0}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="size-5 mr-2" />
              Save {selectedTodos.length > 0 ? `${selectedTodos.length} ` : ''}Action{selectedTodos.length !== 1 ? 's' : ''} to Follow Up
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
