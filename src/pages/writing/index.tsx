import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle 
} from "@/components/ui/resizable";

export default function WritingTest() {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(40 * 60); // 40 minutes in seconds
  const [wordCount, setWordCount] = useState(0);
  const [essayContent, setEssayContent] = useState("");
  const minWords = 250;

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const timeRemainingPercentage = (timer / (40 * 60)) * 100;

  const handleExitTest = () => {
    navigate("/dashboard");
  };

  const countWords = (text: string) => {
    const words = text.trim().split(/\s+/);
    return text.trim() === "" ? 0 : words.length;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEssayContent(text);
    setWordCount(countWords(text));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents right-click context menu
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) { // Right click
      e.preventDefault();
      return;
    }
    if (e.detail > 1) { // Double or triple click
      e.preventDefault();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Clear any selection that might have occurred
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      selection.removeAllRanges();
    }
  };


  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Only prevent paste if it's not a keyboard shortcut
    if (!e.clipboardData) {
      e.preventDefault();
    }
  };

  const handleCopy = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Only prevent copy if there's no selection
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      e.preventDefault();
    }
  };

  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Only prevent cut if there's no selection
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      e.preventDefault();
    }
  };


  return (
    <div className="flex flex-col h-screen">
      {/* Timer Section */}
      <div className="bg-navy-900 text-white p-2 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 w-1/4">
            <span className="font-bold">IELTS Writing Task</span>
          </div>
          
          <div className="flex justify-center w-1/2">
            <div className="flex items-center gap-2 bg-navy-800 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-lg">{formatTime(timer)}</span>
              <span className="text-xs">Time remaining</span>
            </div>
          </div>
          
          <div className="w-1/4 flex justify-end items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleExitTest}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 border-red-500/20 transition-colors duration-200 text-sm font-medium px-4 py-2 rounded-md"
            >
              Exit Test
            </Button>
          </div>
        </div>
        <Progress value={timeRemainingPercentage} className="h-1 bg-gray-700" indicatorClassName="bg-yellow-400" />
      </div>

      {/* Main Content */}
      <div className="flex-1" style={{ overflow: 'hidden' }}>
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-200px)]"
          style={{ overflow: 'hidden' }}
        >
          {/* Instructions Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="rounded-none h-full overflow-hidden border-0 shadow-none">
              <CardContent className="p-6 h-full" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                <Tabs defaultValue="task1" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="task1">Task 1: Essay Writing</TabsTrigger>
                    <TabsTrigger value="task2">Task 2: Report Writing</TabsTrigger>
                  </TabsList>
                  <TabsContent value="task1" className="mt-0">
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-blue-600">IELTS Writing Task 2: Essay</h2>
                      <div className="text-gray-600">
                        <p className="font-medium mb-2">Instructions:</p>
                        <p className="text-blue-600 mb-4">
                          Write an essay in response to the following question. You should spend about 40 minutes on
                          this task. Write at least 250 words.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <p className="text-gray-800">
                            Some people believe that unpaid community service should be a compulsory part of high
                            school programmes. To what extent do you agree or disagree with this statement?
                          </p>
                        </div>
                        <p className="mb-2">
                          Give reasons for your answer and include any relevant examples from your own knowledge or
                          experience.
                        </p>
                        <div className="mt-4 text-sm">
                          <p>Time: 40 minutes</p>
                          <p>Word Limit: 250-300 words</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="task2" className="mt-0">
                    {/* Add content for Task 2 */}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Writing Area */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="rounded-none h-full overflow-hidden border-0 shadow-none">
              <CardContent 
                className="p-6 h-full" 
                style={{ overflowY: 'auto', overflowX: 'hidden' }}
              >
                <div className="h-full flex flex-col">
                  <Textarea
                    placeholder="Start writing your essay here..."
                    className="flex-1 w-full p-4 text-base resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-50/50 focus:bg-white transition-colors duration-200 placeholder:text-gray-500 placeholder:text-base"
                    value={essayContent}
                    onChange={handleTextChange}
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    spellCheck="false"
                    autoCorrect="off"
                    autoCapitalize="off"
                    style={{ 
                      WebkitTextFillColor: 'inherit',
                      cursor: 'text',
                      caretColor: '#2563eb', // Bright blue cursor
                    }}
                    onContextMenu={handleContextMenu}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onPaste={handlePaste}
                    onCopy={handleCopy}
                    onCut={handleCut}
                    onDragStart={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                  />
                  <div className="flex justify-between items-center text-sm py-2 bg-white border-t mt-2">
                    <div className="flex items-center gap-2">
                      <span>Word Count: {wordCount}</span>
                      <span className="text-gray-500">(Minimum: {minWords})</span>
                    </div>
                    <span className={wordCount < minWords ? "text-red-500" : "text-green-500"}>
                      {wordCount < minWords ? `Need ${minWords - wordCount} more words` : "Minimum word count reached"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Submit Essay
          </Button>
        </div>
      </div>
    </div>
  );
} 