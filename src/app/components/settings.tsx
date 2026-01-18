import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Download, FileJson, FileText, Share2, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import { Reflection } from "@/app/components/journal-list";
import jsPDF from "jspdf";
import { format, subDays, isAfter, isBefore, isEqual } from "date-fns";
import { toast } from "sonner";

interface SettingsProps {
  onBack: () => void;
  reflections: Reflection[];
}

type ExportStep = "range" | "format" | "destination" | "confirm";
type DateRange = "7days" | "30days" | "custom" | "all";
type ExportFormat = "pdf" | "json" | "markdown" | "text";
type ExportDestination = "download" | "notion" | "trello";

export function Settings({ onBack, reflections }: SettingsProps) {
  const [currentStep, setCurrentStep] = useState<ExportStep>("range");
  const [selectedRange, setSelectedRange] = useState<DateRange>("all");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [selectedDestination, setSelectedDestination] = useState<ExportDestination>("download");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const getFilteredReflections = () => {
    if (selectedRange === "all") return reflections;

    const now = new Date();
    let startDate: Date;

    if (selectedRange === "7days") {
      startDate = subDays(now, 7);
    } else if (selectedRange === "30days") {
      startDate = subDays(now, 30);
    } else if (selectedRange === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return reflections.filter(r => {
        const refDate = new Date(r.date);
        return (isAfter(refDate, start) || isEqual(refDate, start)) && 
               (isBefore(refDate, end) || isEqual(refDate, end));
      });
    } else {
      return reflections;
    }

    return reflections.filter(r => isAfter(new Date(r.date), startDate) || isEqual(new Date(r.date), startDate));
  };

  const exportToPDF = (data: Reflection[]) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxLineWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      doc.setFontSize(20);
      doc.text("Semester Journal", margin, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.text(`Exported on ${format(new Date(), "MMMM dd, yyyy")}`, margin, yPosition);
      doc.text(`${data.length} reflections included`, margin, yPosition + 5);
      yPosition += 20;

      // Reflections
      data.forEach((reflection, index) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const dateText = format(reflection.date, "MMM dd, yyyy 'at' h:mm a");
        doc.text(dateText, margin, yPosition);
        yPosition += 7;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Entry ${index + 1} • ${reflection.type === "audio" ? "Voice" : "Text"} Reflection`, margin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        const lines = doc.splitTextToSize(reflection.content, maxLineWidth);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });

        if (reflection.selectedActions && reflection.selectedActions.length > 0) {
          yPosition += 5;
          doc.setFont("helvetica", "bold");
          doc.text("Action Items:", margin, yPosition);
          yPosition += 5;
          doc.setFont("helvetica", "normal");
          
          reflection.selectedActions.forEach((action) => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = margin;
            }
            const actionLines = doc.splitTextToSize(`• ${action}`, maxLineWidth - 5);
            actionLines.forEach((line: string) => {
              doc.text(line, margin + 5, yPosition);
              yPosition += 5;
            });
          });
        }

        yPosition += 10;
      });

      doc.save(`semester-journal-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("Journal exported as PDF!");
    } catch (error) {
      console.error("Export to PDF failed:", error);
      toast.error("Failed to export PDF");
    }
  };

  const exportToJSON = (data: Reflection[]) => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const exportFileDefaultName = `semester-journal-${format(new Date(), "yyyy-MM-dd")}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      
      toast.success("Journal exported as JSON!");
    } catch (error) {
      console.error("Export to JSON failed:", error);
      toast.error("Failed to export JSON");
    }
  };

  const exportToMarkdown = (data: Reflection[]) => {
    try {
      let markdown = `# Semester Journal\n\n`;
      markdown += `Exported on ${format(new Date(), "MMMM dd, yyyy")}\n\n`;
      markdown += `${data.length} reflections included\n\n---\n\n`;

      data.forEach((reflection, index) => {
        markdown += `## Entry ${index + 1} - ${format(reflection.date, "MMMM dd, yyyy 'at' h:mm a")}\n\n`;
        markdown += `**Type:** ${reflection.type === "audio" ? "Voice" : "Text"} Reflection\n\n`;
        markdown += `${reflection.content}\n\n`;

        if (reflection.selectedActions && reflection.selectedActions.length > 0) {
          markdown += `### Action Items\n\n`;
          reflection.selectedActions.forEach((action) => {
            markdown += `- ${action}\n`;
          });
          markdown += `\n`;
        }

        markdown += `---\n\n`;
      });

      const dataUri = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`;
      const exportFileDefaultName = `semester-journal-${format(new Date(), "yyyy-MM-dd")}.md`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      
      toast.success("Journal exported as Markdown!");
    } catch (error) {
      console.error("Export to Markdown failed:", error);
      toast.error("Failed to export Markdown");
    }
  };

  const exportToText = (data: Reflection[]) => {
    try {
      let text = `SEMESTER JOURNAL\n\n`;
      text += `Exported on ${format(new Date(), "MMMM dd, yyyy")}\n`;
      text += `${data.length} reflections included\n\n`;
      text += `${"=".repeat(60)}\n\n`;

      data.forEach((reflection, index) => {
        text += `ENTRY ${index + 1}\n`;
        text += `Date: ${format(reflection.date, "MMMM dd, yyyy 'at' h:mm a")}\n`;
        text += `Type: ${reflection.type === "audio" ? "Voice" : "Text"} Reflection\n\n`;
        text += `${reflection.content}\n\n`;

        if (reflection.selectedActions && reflection.selectedActions.length > 0) {
          text += `Action Items:\n`;
          reflection.selectedActions.forEach((action) => {
            text += `  • ${action}\n`;
          });
          text += `\n`;
        }

        text += `${"-".repeat(60)}\n\n`;
      });

      const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
      const exportFileDefaultName = `semester-journal-${format(new Date(), "yyyy-MM-dd")}.txt`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      
      toast.success("Journal exported as Text!");
    } catch (error) {
      console.error("Export to Text failed:", error);
      toast.error("Failed to export Text");
    }
  };

  const handleExport = () => {
    const data = getFilteredReflections();

    if (data.length === 0) {
      toast.error("No reflections found for the selected date range");
      return;
    }

    if (selectedDestination === "download") {
      switch (selectedFormat) {
        case "pdf":
          exportToPDF(data);
          break;
        case "json":
          exportToJSON(data);
          break;
        case "markdown":
          exportToMarkdown(data);
          break;
        case "text":
          exportToText(data);
          break;
      }
      // Reset to beginning
      setTimeout(() => {
        setCurrentStep("range");
        setSelectedRange("all");
        setSelectedFormat("pdf");
        setSelectedDestination("download");
      }, 1000);
    } else {
      // Notion or Trello - show coming soon
      const destination = selectedDestination === "notion" ? "Notion" : "Trello";
      toast.info(`${destination} export coming soon! Use download option for now.`, {
        duration: 4000,
      });
    }
  };

  const canProceed = () => {
    if (currentStep === "range") {
      if (selectedRange === "custom") {
        return customStartDate && customEndDate;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === "range") setCurrentStep("format");
    else if (currentStep === "format") setCurrentStep("destination");
    else if (currentStep === "destination") setCurrentStep("confirm");
  };

  const handleBack = () => {
    if (currentStep === "format") setCurrentStep("range");
    else if (currentStep === "destination") setCurrentStep("format");
    else if (currentStep === "confirm") setCurrentStep("destination");
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "range": return "Select Date Range";
      case "format": return "Select Format";
      case "destination": return "Select Destination";
      case "confirm": return "Confirm Export";
    }
  };

  const getRangeSummary = () => {
    const count = getFilteredReflections().length;
    switch (selectedRange) {
      case "7days": return `Last 7 days (${count} reflections)`;
      case "30days": return `Last 30 days (${count} reflections)`;
      case "custom": return customStartDate && customEndDate 
        ? `${format(new Date(customStartDate), "MMM dd")} - ${format(new Date(customEndDate), "MMM dd")} (${count} reflections)`
        : "Custom range";
      case "all": return `All reflections (${count} entries)`;
    }
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg">
        <div className="px-6 pt-12 pb-6">
          <button
            onClick={currentStep === "range" ? onBack : handleBack}
            className="flex items-center gap-2 mb-4 text-purple-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Export Journal</h1>
          <p className="text-purple-100 text-sm mt-1">{getStepTitle()}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          {["range", "format", "destination", "confirm"].map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  currentStep === step 
                    ? "bg-purple-600 text-white" 
                    : index < ["range", "format", "destination", "confirm"].indexOf(currentStep)
                    ? "bg-purple-200 text-purple-700"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {index + 1}
                </div>
              </div>
              {index < 3 && (
                <div className={`h-0.5 flex-1 transition-colors ${
                  index < ["range", "format", "destination", "confirm"].indexOf(currentStep)
                    ? "bg-purple-200"
                    : "bg-gray-200"
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Step 1: Date Range */}
        {currentStep === "range" && (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedRange("7days")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedRange === "7days"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Last 7 days</div>
                  <div className="text-sm text-gray-600 mt-1">Recent reflections from this week</div>
                </div>
                {selectedRange === "7days" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>

            <button
              onClick={() => setSelectedRange("30days")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedRange === "30days"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Last 30 days</div>
                  <div className="text-sm text-gray-600 mt-1">Reflections from the past month</div>
                </div>
                {selectedRange === "30days" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>

            <button
              onClick={() => setSelectedRange("custom")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedRange === "custom"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900">Custom range</div>
                  <div className="text-sm text-gray-600 mt-1">Choose specific dates</div>
                </div>
                {selectedRange === "custom" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
              {selectedRange === "custom" && (
                <div className="space-y-2 pt-3 border-t border-purple-200">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Start date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">End date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedRange("all")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedRange === "all"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">All reflections</div>
                  <div className="text-sm text-gray-600 mt-1">Export your complete journal</div>
                </div>
                {selectedRange === "all" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Format */}
        {currentStep === "format" && (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedFormat("pdf")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedFormat === "pdf"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <FileText className="size-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">PDF</div>
                  <div className="text-sm text-gray-600 mt-1">Formatted document, easy to share</div>
                </div>
                {selectedFormat === "pdf" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>

            <button
              onClick={() => setSelectedFormat("json")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedFormat === "json"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <FileJson className="size-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">JSON</div>
                  <div className="text-sm text-gray-600 mt-1">Data format, import to other apps</div>
                </div>
                {selectedFormat === "json" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>

            <button
              onClick={() => setSelectedFormat("markdown")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedFormat === "markdown"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <FileText className="size-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Markdown</div>
                  <div className="text-sm text-gray-600 mt-1">Plain text with formatting</div>
                </div>
                {selectedFormat === "markdown" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>

            <button
              onClick={() => setSelectedFormat("text")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedFormat === "text"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <FileText className="size-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Text (.txt)</div>
                  <div className="text-sm text-gray-600 mt-1">Simple text file</div>
                </div>
                {selectedFormat === "text" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>
          </div>
        )}

        {/* Step 3: Destination */}
        {currentStep === "destination" && (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedDestination("download")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedDestination === "download"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Download className="size-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Download to device</div>
                  <div className="text-sm text-gray-600 mt-1">Save file to your computer</div>
                </div>
                {selectedDestination === "download" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>

            <button
              onClick={() => setSelectedDestination("notion")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedDestination === "notion"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Share2 className="size-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Export to Notion</div>
                  <div className="text-sm text-gray-600 mt-1">Sync to your Notion workspace</div>
                </div>
                {selectedDestination === "notion" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>

            <button
              onClick={() => setSelectedDestination("trello")}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedDestination === "trello"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Share2 className="size-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Export to Trello</div>
                  <div className="text-sm text-gray-600 mt-1">Create cards from reflections</div>
                </div>
                {selectedDestination === "trello" && <CheckCircle2 className="size-5 text-purple-600" />}
              </div>
            </button>
          </div>
        )}

        {/* Step 4: Confirm */}
        {currentStep === "confirm" && (
          <div>
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 space-y-3 mb-6">
              <div>
                <div className="text-xs text-purple-600 font-medium mb-1">DATE RANGE</div>
                <div className="text-sm font-semibold text-purple-900">{getRangeSummary()}</div>
              </div>
              <div className="h-px bg-purple-200"></div>
              <div>
                <div className="text-xs text-purple-600 font-medium mb-1">FORMAT</div>
                <div className="text-sm font-semibold text-purple-900 uppercase">{selectedFormat}</div>
              </div>
              <div className="h-px bg-purple-200"></div>
              <div>
                <div className="text-xs text-purple-600 font-medium mb-1">DESTINATION</div>
                <div className="text-sm font-semibold text-purple-900">
                  {selectedDestination === "download" ? "Download to device" : 
                   selectedDestination === "notion" ? "Export to Notion" : "Export to Trello"}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex gap-2">
                <div className="text-blue-600 mt-0.5">ℹ️</div>
                <div className="text-sm text-blue-900">
                  {selectedDestination === "download" 
                    ? `Your journal will be downloaded as a ${selectedFormat.toUpperCase()} file.`
                    : `You'll be redirected to ${selectedDestination === "notion" ? "Notion" : "Trello"} to authorize the export.`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 pt-6 space-y-3">
        {currentStep !== "confirm" ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full gap-2 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl font-semibold"
          >
            Continue
            <ChevronRight className="size-5" />
          </Button>
        ) : (
          <Button
            onClick={handleExport}
            className="w-full gap-2 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl font-semibold"
          >
            <Download className="size-5" />
            Confirm Export
          </Button>
        )}
      </div>
    </div>
  );
}
