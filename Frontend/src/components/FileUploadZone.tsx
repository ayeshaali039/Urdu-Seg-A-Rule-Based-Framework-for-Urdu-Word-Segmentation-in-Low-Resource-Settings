import { useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
}

const FileUploadZone = ({ onFileUpload }: FileUploadZoneProps) => {
  const { toast } = useToast();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile) {
        onFileUpload(droppedFile);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-upload-border bg-upload-bg rounded-lg p-12 text-center transition-all hover:border-primary hover:bg-upload-bg/80 cursor-pointer"
    >
      <label htmlFor="file-upload" className="cursor-pointer block">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-12 w-12 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Drop your CSV file here
            </h3>
            <p className="text-muted-foreground">
              or click to browse from your computer
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-muted rounded-full">CSV only</span>
            <span className="px-3 py-1 bg-muted rounded-full">Urdu text</span>
          </div>
        </div>

        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default FileUploadZone;
