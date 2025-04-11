import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { setCurrentTest, setLoading, setError } from "@/store/features/testSlice";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Timer from "@/lib/Timer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

// Define interfaces for writing parts
interface WritingPart {
  id: number;
  partHeading: string;
  instructions: string;
  partOrder: number;
  contentType: "image" | "text";
}

interface WritingTestProps {
  onComplete?: () => void;
  test?: any; // Use any for now, can be typed more strictly if needed
}

export default function WritingTest({ onComplete, test }: WritingTestProps) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isLoading, error } = useSelector((state: RootState) => state.test);
  
  const [timer, setTimer] = useState(60); // Default 60 minutes    
  const [currentPart, setCurrentPart] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, string>>({
    part1: "",
    part2: ""
  });
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({
    part1: 0,
    part2: 0
  });
  const [pageLoading, setPageLoading] = useState(true);

  // Find the writing module
  const writingModule = test;

  // Get writing parts
  const writingParts = writingModule?.partDetails as unknown as WritingPart[] || [];

  // Set timer based on module data when available
  useEffect(() => {
    if (writingModule?.allowedTime && writingModule.timeUnit === "minutes") {
      setTimer(writingModule.allowedTime * 60);
    }
  }, [writingModule]);

  // Fetch test data if not already in Redux store
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) {
        setPageLoading(false);
        return;
      }

      // If test already loaded in Redux, don't fetch again
      if (writingModule && writingModule.id === testId) {
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        dispatch(setLoading(true));
        
        const response = await api.get(`/api/tests/${testId}`, user?.token || "");
        console.log("Test Details Response:", response);
        
        if (response.status === 200) {
          dispatch(setCurrentTest(response.data));
        } else {
          dispatch(setError(response.message || "Failed to load test details"));
        }
      } catch (error: any) {
        console.error("Error loading test details:", error);
        dispatch(setError(error.message || "An error occurred while loading test details"));
      } finally {
        setPageLoading(false);
        dispatch(setLoading(false));
      }
    };

    fetchTestData();
  }, [testId, writingModule?.id, dispatch, user?.token]);

  // Start the countdown timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer ? prevTimer - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  // Calculate time remaining percentage
  const timeRemainingPercentage = writingModule?.allowedTime
    ? (timer / (writingModule.allowedTime * 60)) * 100
    : 100;

  const handleExitTest = () => {
    navigate("/dashboard");
  };

  const handleTextChange = (part: number, value: string) => {
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    
    setAnswers(prev => ({
      ...prev,
      [`part${part}`]: value
    }));
    
    setWordCounts(prev => ({
      ...prev,
      [`part${part}`]: wordCount
    }));
  };

  const handleSubmitAnswer = () => {
    setTimer(0);
    console.log("Submitting answers:", answers);
    onComplete?.();
  };

  // Loading and error states
  if (pageLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate("/dashboard")}>Go Back</Button>
      </div>
    );
  }

  if (!writingModule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Not Found</h1>
        <p className="text-gray-600 mb-4">The requested writing test could not be found.</p>
        <Button onClick={() => navigate("/dashboard")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Timer Section */}
      <Timer 
        readingModule={writingModule} 
        timer={timer} 
        handleExitTest={handleExitTest} 
        timeRemainingPercentage={timeRemainingPercentage} 
      />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <Tabs 
          defaultValue="part1" 
          className="w-full"
          onValueChange={(value) => setCurrentPart(Number(value.replace('part', '')))}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="part1" className="flex-1">
              {writingParts[0]?.partHeading || "Part 1"}
            </TabsTrigger>
            <TabsTrigger value="part2" className="flex-1">
              {writingParts[1]?.partHeading || "Part 2"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="part1">
            <Card>
              <CardContent className="p-6">
                {/* Instructions */}
                <div 
                  className="mb-6 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: writingParts[0]?.instructions || "" }}
                />

                {/* Content Area */}
                {writingParts[0]?.contentType === "image" && (
                  <div className="mb-6 bg-gray-100 rounded-lg p-4 text-center">
                    [Image Content Area]
                  </div>
                )}

                {/* Writing Area */}
                <div className="space-y-4">
                  <Textarea
                    placeholder="Start writing here..."
                    className="min-h-[300px] font-mono"
                    value={answers.part1}
                    onChange={(e) => handleTextChange(1, e.target.value)}
                    // Disable grammar and spell checking
                    // data-gramm="false"
                    // data-gramm_editor="false"
                    // data-enable-grammarly="false"
                    // spellCheck="false"
                    // autoCorrect="off"
                    // autoCapitalize="off"
                    // // Prevent extensions from injecting content
                    // data-ms-editor="false"
                    // data-lt-installed="false"
                    // Custom styles to prevent interference
                    style={{ 
                      WebkitTextFillColor: 'inherit',
                      caretColor: '#2563eb',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    // Completely disable copy-paste and text selection
                    // onContextMenu={(e) => e.preventDefault()}
                    // onCopy={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                    // onPaste={(e) => e.preventDefault()}
                    // onDragStart={(e) => e.preventDefault()}
                    // onDrop={(e) => e.preventDefault()}
                    // onKeyDown={(e) => {
                    //   // Prevent Ctrl+C, Ctrl+V, Ctrl+X
                    //   if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
                    //     e.preventDefault();
                    //   }
                    // }}
                  />
                  
                  {/* Word Count */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Word Count: {wordCounts.part1}
                    </span>
                    <span className={`font-medium ${
                      wordCounts.part1 >= 150 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      Minimum required: 150 words
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="part2">
            <Card>
              <CardContent className="p-6">
                {/* Instructions */}
                <div 
                  className="mb-6 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: writingParts[1]?.instructions || "" }}
                />

                {/* Content Area */}
                {writingParts[1]?.contentType === "image" && (
                  <div className="mb-6 bg-gray-100 rounded-lg p-4 text-center">
                    [Image Content Area]
                  </div>
                )}

                {/* Writing Area */}
                <div className="space-y-4">
                  <Textarea
                    placeholder="Start writing here..."
                    className="min-h-[300px] font-mono"
                    value={answers.part2}
                    onChange={(e) => handleTextChange(2, e.target.value)}
                    // Disable grammar and spell checking
                    // data-gramm="false"
                    // data-gramm_editor="false"
                    // data-enable-grammarly="false"
                    // spellCheck="false"
                    // autoCorrect="off"
                    // autoCapitalize="off"
                    // // Prevent extensions from injecting content
                    // data-ms-editor="false"
                    // data-lt-installed="false"
                    // Custom styles to prevent interference
                    style={{ 
                      WebkitTextFillColor: 'inherit',
                      caretColor: '#2563eb',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    // Completely disable copy-paste and text selection
                    // onContextMenu={(e) => e.preventDefault()}
                    // onCopy={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                    // onPaste={(e) => e.preventDefault()}
                    // onDragStart={(e) => e.preventDefault()}
                    // onDrop={(e) => e.preventDefault()}
                    // onKeyDown={(e) => {
                    //   // Prevent Ctrl+C, Ctrl+V, Ctrl+X
                    //   if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
                    //     e.preventDefault();
                    //   }
                    // }}
                  />
                  
                  {/* Word Count */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Word Count: {wordCounts.part2}
                    </span>
                    <span className={`font-medium ${
                      wordCounts.part2 >= 250 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      Minimum required: 250 words
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Submit Button */}
        <div className="mt-6 flex justify-end ">
          <Button 
            onClick={handleSubmitAnswer}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            disabled={wordCounts.part1 < 150 || wordCounts.part2 < 250}
          >
            Submit Test
          </Button>
        </div>
      </div>
    </div>
  );
} 