import { useState } from "react";
import { Upload, FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import FileUploadZone from "@/components/FileUploadZone";
import ProcessingState from "@/components/ProcessingState";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [tokenizedData, setTokenizedData] = useState<Blob | null>(null);
  const { toast } = useToast();

  // Backend API URL - update this if your backend runs on a different port
  const API_URL = "http://localhost:5000";

  const validateUrduText = (text: string): boolean => {
    // Urdu Unicode range: \u0600-\u06FF (Arabic/Urdu script)
    const urduRegex = /[\u0600-\u06FF]/;
    return urduRegex.test(text);
  };

  const handleFileUpload = async (uploadedFile: File) => {
    if (!uploadedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file only.",
        variant: "destructive",
      });
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);
    setIsComplete(false);

    // Read and validate CSV content
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;

      // Check if file contains Urdu text
      if (!validateUrduText(text)) {
        toast({
          title: "Language validation failed",
          description: "The file must contain Urdu text only.",
          variant: "destructive",
        });
        setIsProcessing(false);
        setFile(null);
        return;
      }

      // Send file to backend for tokenization
      try {
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const response = await fetch(`${API_URL}/tokenize`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // Get the tokenized CSV as a blob
        const blob = await response.blob();
        setTokenizedData(blob);
        setIsProcessing(false);
        setIsComplete(true);

        toast({
          title: "Processing complete!",
          description: "Your tokenized file is ready for download.",
        });
      } catch (error) {
        console.error('Tokenization error:', error);
        toast({
          title: "Processing failed",
          description: error instanceof Error ? error.message : "An error occurred during tokenization. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        setFile(null);
      }
    };

    reader.readAsText(uploadedFile);
  };

  const handleDownload = () => {
    if (!tokenizedData || !file) return;

    // Extract original filename without extension
    const originalName = file.name.replace(/\.csv$/i, '');
    const downloadFileName = `${originalName}_tokenized_output.csv`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(tokenizedData);
    link.download = downloadFileName;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "Download started",
      description: `Downloading ${downloadFileName}`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setIsProcessing(false);
    setIsComplete(false);
    setTokenizedData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Urdu Text Tokenizer
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your CSV file with Urdu text and get tokenized output
          </p>
        </header>

        {/* Main Card */}
        <Card className="p-8">
          {!file && !isProcessing && !isComplete && (
            <FileUploadZone onFileUpload={handleFileUpload} />
          )}

          {isProcessing && (
            <ProcessingState fileName={file?.name || ""} />
          )}

          {isComplete && (
            <div className="text-center space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-center">
                <CheckCircle2 className="h-20 w-20 text-success" />
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Processing Complete!
                </h3>
                <p className="text-muted-foreground">
                  Your file has been successfully tokenized
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-success" />
                    <span className="font-medium">
                      {file?.name.replace(/\.csv$/i, '')}_tokenized_output.csv
                    </span>
                  </div>
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <Button variant="outline" onClick={handleReset} className="w-full">
                Process Another File
              </Button>
            </div>
          )}
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold mb-1">CSV Only</h4>
                <p className="text-sm text-muted-foreground">
                  Only CSV files are accepted
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Urdu Text</h4>
                <p className="text-sm text-muted-foreground">
                  File must contain Urdu language text
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Fast Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Get tokenized results in seconds
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;