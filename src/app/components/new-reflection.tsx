import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Card } from "@/app/components/ui/card";
import { Mic, MicOff, Trash2, Edit3, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NewReflectionProps {
  onSave: (content: string, type: "text" | "audio", hasAudio: boolean) => void;
  onCancel: () => void;
}

export function NewReflection({ onSave, onCancel }: NewReflectionProps) {
  const [mode, setMode] = useState<"choice" | "text" | "audio">("choice");
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasAudioFile, setHasAudioFile] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    // Simulate recording without accessing microphone
    setIsRecording(true);
    setRecordingTime(0);
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    simulateTranscription();
  };

  const simulateTranscription = () => {
    setIsTranscribing(true);
    setHasAudioFile(true);
    
    // Simulate transcription delay
    setTimeout(() => {
      const mockTranscriptions = [
        "This semester has been incredibly challenging but rewarding. I've learned so much in my computer science classes, especially about algorithms and data structures. I'm struggling a bit with time management, but I think I need to create a better study schedule.",
        "Today's lecture on machine learning was fascinating. I realized I need to review the linear algebra concepts to fully understand the material. I should also start working on the final project earlier this time to avoid last-minute stress.",
        "Feeling overwhelmed with midterms coming up. I have three exams in the same week. Need to prioritize my study time better and maybe form a study group for my statistics class.",
        "Had a great discussion in my philosophy class today about ethics in technology. It made me think about how the things I'm learning in my tech courses have real-world implications. I want to explore this intersection more.",
        "The group project is going well but communication could be better. I need to set up regular check-ins with my team members and make sure everyone is on the same page about deadlines.",
        "Just realized I've been neglecting my physical health with all this studying. Need to incorporate some exercise into my daily routine, even if it's just a 20-minute walk."
      ];
      
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      setTranscribedText(randomTranscription);
      setIsTranscribing(false);
      toast.success("Audio transcribed successfully!");
    }, 2000);
  };

  const deleteAudio = () => {
    setHasAudioFile(false);
    toast.success("Audio file deleted for privacy");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSave = () => {
    if (mode === "text" && textContent.trim()) {
      onSave(textContent, "text", false);
      toast.success("Reflection saved!");
    } else if (mode === "audio" && transcribedText.trim()) {
      onSave(transcribedText, "audio", hasAudioFile);
      toast.success("Reflection saved!");
    }
  };

  if (mode === "choice") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">New Reflection</h2>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="size-5" />
          </Button>
        </div>
        
        <p className="text-gray-600">
          How would you like to capture your thoughts today?
        </p>
        
        <div className="space-y-4">
          <Card
            className="p-6 cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all duration-200 border-2 bg-gradient-to-br from-white to-purple-50"
            onClick={() => setMode("text")}
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-purple-100 rounded-2xl">
                <Edit3 className="size-7 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">Write Text</h3>
                <p className="text-sm text-gray-600">Type your reflection directly</p>
              </div>
            </div>
          </Card>
          
          <Card
            className="p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 border-2 bg-gradient-to-br from-white to-blue-50"
            onClick={() => setMode("audio")}
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-100 rounded-2xl">
                <Mic className="size-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">Record Audio</h3>
                <p className="text-sm text-gray-600">Speak your thoughts naturally</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "text") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <FileText className="size-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Write Reflection</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="size-5" />
          </Button>
        </div>
        
        <Textarea
          placeholder="What's on your mind about this semester? Share your thoughts, challenges, and victories..."
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="min-h-[350px] resize-none text-base border-2 focus:border-purple-300 rounded-xl p-4"
          autoFocus
        />
        
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1 h-12 rounded-xl border-2">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!textContent.trim()}
            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold"
          >
            Save Reflection
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "audio") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Mic className="size-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Record Reflection</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="size-5" />
          </Button>
        </div>
        
        {!hasRecorded && !isRecording && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center size-28 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <Mic className="size-14 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Record</h3>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              Tap the button below to start recording your reflection
            </p>
            <Button 
              onClick={startRecording} 
              size="lg" 
              className="gap-2 h-14 px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl font-semibold shadow-lg"
            >
              <Mic className="size-5" />
              Start Recording
            </Button>
          </div>
        )}
        
        {isRecording && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center size-28 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-lg animate-pulse">
              <Mic className="size-14 text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">{formatTime(recordingTime)}</div>
            <p className="text-gray-600 mb-8">Recording in progress...</p>
            <Button 
              onClick={stopRecording} 
              variant="destructive" 
              size="lg" 
              className="gap-2 h-14 px-8 rounded-2xl font-semibold shadow-lg"
            >
              <MicOff className="size-5" />
              Stop Recording
            </Button>
          </div>
        )}
        
        {hasRecorded && (
          <div className="space-y-5">
            {isTranscribing && (
              <Card className="p-8 text-center border-2 bg-gradient-to-br from-purple-50 to-white">
                <Loader2 className="size-12 text-purple-600 mx-auto mb-4 animate-spin" />
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Transcribing Audio</h3>
                <p className="text-gray-600">Converting your speech to text...</p>
              </Card>
            )}
            
            {!isTranscribing && transcribedText && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-800">Transcription</h3>
                  <div className="flex gap-2">
                    {hasAudioFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deleteAudio}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                        Delete Audio
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Edit3 className="size-4" />
                      {isEditing ? "Done" : "Edit"}
                    </Button>
                  </div>
                </div>
                
                {isEditing ? (
                  <Textarea
                    value={transcribedText}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    className="min-h-[250px] border-2 focus:border-purple-300 rounded-xl p-4"
                  />
                ) : (
                  <Card className="p-5 border-2 bg-gradient-to-br from-white to-purple-50">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{transcribedText}</p>
                  </Card>
                )}
                
                <div className="flex gap-3">
                  <Button onClick={onCancel} variant="outline" className="flex-1 h-12 rounded-xl border-2">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold"
                  >
                    Save Reflection
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
