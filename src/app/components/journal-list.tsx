import { Card } from "@/app/components/ui/card";
import { Mic, FileText, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export interface Reflection {
  id: string;
  type: "text" | "audio";
  content: string;
  date: Date;
  hasAudio: boolean;
  todos: string[];
  selectedActions?: string[];
}

interface JournalListProps {
  reflections: Reflection[];
  onSelectReflection: (reflection: Reflection) => void;
}

export function JournalList({ reflections, onSelectReflection }: JournalListProps) {
  return (
    <div className="space-y-3">
      {reflections.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="inline-flex p-6 bg-purple-100 rounded-full mb-4">
            <FileText className="size-16 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Start Your Journey</h3>
          <p className="text-gray-600 max-w-xs mx-auto">
            Begin capturing your semester thoughts and reflections. Your first entry is just a tap away!
          </p>
        </div>
      ) : (
        reflections.map((reflection) => (
          <Card
            key={reflection.id}
            className="p-5 cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all duration-200 bg-white border-2"
            onClick={() => onSelectReflection(reflection)}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                <div className={`p-2.5 rounded-xl ${
                  reflection.type === "audio" 
                    ? "bg-purple-100" 
                    : "bg-blue-100"
                }`}>
                  {reflection.type === "audio" ? (
                    <Mic className="size-5 text-purple-600" />
                  ) : (
                    <FileText className="size-5 text-blue-600" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-gray-400" />
                  <span className="text-sm text-gray-500 font-medium">
                    {format(reflection.date, "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <p className="line-clamp-3 text-gray-700 leading-relaxed mb-3">
                  {reflection.content}
                </p>
                {reflection.selectedActions && reflection.selectedActions.length > 0 && (
                  <div className="space-y-2">
                    {reflection.selectedActions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                        <CheckCircle2 className="size-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-purple-700 font-medium line-clamp-2">
                          {action}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
