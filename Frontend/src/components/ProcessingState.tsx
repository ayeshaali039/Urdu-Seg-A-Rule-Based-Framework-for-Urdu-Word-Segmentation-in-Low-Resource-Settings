import { Loader2, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface ProcessingStateProps {
  fileName: string;
}

const ProcessingState = ({ fileName }: ProcessingStateProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center space-y-6 py-8 animate-in fade-in duration-300">
      <div className="flex justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-foreground">
          Processing your file
        </h3>
        <p className="text-muted-foreground">
          Tokenizing Urdu text, please wait...
        </p>
      </div>

      <div className="bg-muted p-4 rounded-lg max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm truncate">{fileName}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>Validating Urdu text</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>Tokenizing content</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingState;
