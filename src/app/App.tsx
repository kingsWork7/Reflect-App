import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { JournalList, type Reflection } from "@/app/components/journal-list";
import { NewReflection } from "@/app/components/new-reflection";
import { ReflectionDetail } from "@/app/components/reflection-detail";
import { Settings } from "@/app/components/settings";
import { Plus, BookOpen, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { Toaster } from "@/app/components/ui/sonner";

type View = "list" | "new" | "detail" | "settings";

export default function App() {
  const [view, setView] = useState<View>("list");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);

  // Load reflections from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("journal-reflections");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      const reflectionsWithDates = parsed.map((r: any) => ({
        ...r,
        date: new Date(r.date),
      }));
      setReflections(reflectionsWithDates);
    }
  }, []);

  // Save reflections to localStorage whenever they change
  useEffect(() => {
    if (reflections.length > 0) {
      localStorage.setItem("journal-reflections", JSON.stringify(reflections));
    }
  }, [reflections]);

  const handleSaveReflection = (content: string, type: "text" | "audio", hasAudio: boolean) => {
    const newReflection: Reflection = {
      id: Date.now().toString(),
      type,
      content,
      date: new Date(),
      hasAudio,
      todos: [],
      selectedActions: [],
    };

    setReflections([newReflection, ...reflections]);
    setSelectedReflection(newReflection);
    setView("detail");
  };

  const handleSelectReflection = (reflection: Reflection) => {
    setSelectedReflection(reflection);
    setView("detail");
  };

  const handleSaveActions = (reflectionId: string, actions: string[]) => {
    setReflections(prev =>
      prev.map(r =>
        r.id === reflectionId
          ? { ...r, selectedActions: actions }
          : r
      )
    );
    
    if (selectedReflection) {
      setSelectedReflection({
        ...selectedReflection,
        selectedActions: actions,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Toaster />
      
      {/* Phone Frame */}
      <div className="relative">
        {/* Phone Device */}
        <div className="relative w-[380px] h-[780px] bg-gray-900 rounded-[3rem] shadow-2xl p-3 border-[14px] border-gray-800">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-20"></div>
          
          {/* Screen */}
          <div className="relative w-full h-full bg-white rounded-[2.3rem] overflow-hidden">
            {/* App Content */}
            <div className="h-full overflow-y-auto bg-gradient-to-b from-purple-50 to-white">
              <div className="min-h-full flex flex-col">
                {/* Header */}
                {view === "list" && (
                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg">
                    <div className="px-6 pt-12 pb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                            <BookOpen className="size-7 text-white" />
                          </div>
                          <div>
                            <h1 className="text-2xl font-bold text-white">Semester Journal</h1>
                            <p className="text-purple-100 text-sm mt-0.5">
                              Capture your academic journey
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setView("settings")}
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <SettingsIcon className="size-6 text-white" />
                        </button>
                      </div>
                      
                      {reflections.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full w-fit">
                          <Sparkles className="size-4 text-purple-200" />
                          <span className="text-sm text-purple-100 font-medium">
                            {reflections.length} {reflections.length === 1 ? "reflection" : "reflections"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Main content */}
                <div className="flex-1 px-4 py-6">
                  {view === "list" && (
                    <JournalList
                      reflections={reflections}
                      onSelectReflection={handleSelectReflection}
                    />
                  )}

                  {view === "new" && (
                    <NewReflection
                      onSave={handleSaveReflection}
                      onCancel={() => setView("list")}
                    />
                  )}

                  {view === "detail" && selectedReflection && (
                    <ReflectionDetail
                      reflection={selectedReflection}
                      onBack={() => setView("list")}
                      onSaveActions={handleSaveActions}
                    />
                  )}

                  {view === "settings" && (
                    <Settings
                      onBack={() => setView("list")}
                      reflections={reflections}
                    />
                  )}
                </div>

                {/* Floating action button */}
                {view === "list" && (
                  <div className="sticky bottom-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12">
                    <Button
                      onClick={() => setView("new")}
                      size="lg"
                      className="w-full gap-2 shadow-xl h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl font-semibold"
                    >
                      <Plus className="size-5" />
                      New Reflection
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
        
        {/* Side Buttons */}
        <div className="absolute right-0 top-32 w-1 h-12 bg-gray-800 rounded-l"></div>
        <div className="absolute right-0 top-48 w-1 h-16 bg-gray-800 rounded-l"></div>
        <div className="absolute right-0 top-68 w-1 h-16 bg-gray-800 rounded-l"></div>
      </div>
    </div>
  );
}