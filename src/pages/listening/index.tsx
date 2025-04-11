import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Timer from "@/lib/Timer";
import { AlertCircle, Play, Pause } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { setCurrentTest, setLoading, setError } from "@/store/features/testSlice";
import { Question, Option, TestModule } from "@/store/features/testSlice";
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle 
} from "@/components/ui/resizable";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { testSubtitles, parseSubtitleFile } from "@/utils/subtitleParser";
import { Subtitle } from "@/types/subtitle";

// Extend PartDetails to include subtitles
interface PartDetailsWithSubtitles {
  id: string;
  partHeading: string;
  passageHeading?: string;
  instructions?: string;
  audioURL?: string;
  question_groups?: any[];
  subtitles?: Subtitle[];
}

// Define interfaces for map labeling
interface MapLabelingContent {
  id: number;
  questionId: string;
}

// Define content item interfaces
interface TextContent {
  type: "text";
  content: string;
}

interface QuestionContent {
  type: "question";
  id: number;
  questionId: string;
  inputType: string;
}

type ContentItem = TextContent | QuestionContent;

interface QuestionGroup {
  id: string;
  name: string;
  type: string;
  heading?: string;
  instructions?: string;
  questionsRange?: string;
  answerType?: string;
  content?: ContentItem[];
  questions?: Question[];
}

interface ListeningTestProps {
  onComplete?: () => void;
  test?: any; // Use any for now, can be typed more strictly if needed
}

export default function ListeningTest({ onComplete }: ListeningTestProps) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentTest, isLoading, error } = useSelector((state: RootState) => state.test);
  
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionGroup, setCurrentQuestionGroup] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [lastSelectedQuestion, setLastSelectedQuestion] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [timer, setTimer] = useState(60); // Default 60 minutes    
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pageLoading, setPageLoading] = useState(true);
  const [parsedSubtitles, setParsedSubtitles] = useState<Subtitle[]>([]);
  const [currentSection, setCurrentSection] = useState<string>("");

  // Add a ref to scroll to selected question
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const listeningModule = currentTest;

  // Get current part data
  const currentPartDetails = listeningModule?.partDetails?.[currentPartIndex] as PartDetailsWithSubtitles | undefined;
  // Get current question group data
  const currentQuestionGroupData = currentPartDetails?.question_groups?.[currentQuestionGroup];

  // Set timer based on module data when available
  useEffect(() => {
    if (listeningModule?.allowedTime && listeningModule.timeUnit === "minutes") {
      setTimer(listeningModule.allowedTime * 60);
    }
  }, [listeningModule]);

  // Initialize audio and parse subtitles
  useEffect(() => {
    if (listeningModule) {
      // Parse the subtitles
      const { sections, subtitles } = parseSubtitleFile(testSubtitles);
      setParsedSubtitles(subtitles);

      // Use the provided audioURL or fall back to default audio from public directory
      const audioSource = '/audio/ListeningTest-1Audio.mp3';
      const audio = new Audio(audioSource);

      console.log("Audio Source:", audio);
      console.log("Parsed Sections:", sections);
      
      audio.addEventListener('timeupdate', () => {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
        
        // Update subtitle and section based on current time
        const currentSub = subtitles.find(sub => 
          audio.currentTime >= sub.startTime && audio.currentTime <= sub.endTime
        );
        setCurrentSubtitle(currentSub?.text || "");

        // Find current section
        const currentSec = sections.find(section =>
          audio.currentTime >= section.startTime && audio.currentTime <= section.endTime
        );
        if (currentSec) {
          setCurrentSection(currentSec.title);
        }
      });
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        toast.error('Error loading audio file. Please check if the audio file exists.');
      });
      
      setCurrentAudio(audio);
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [listeningModule]);

  // Fetch test data if not already in Redux store
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) {
        setPageLoading(false);
        return;
      }

      // If test already loaded in Redux, don't fetch again
      if (currentTest && currentTest.id === testId) {
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        dispatch(setLoading(true));
        
        // Fetch test details from API
        const response = await api.get(`/api/tests/${testId}`, user?.token || "");
        console.log("Test Details Response:", response);
        
        if (response.status === 200) {
          dispatch(setCurrentTest(response.data));
        } else {
          dispatch(setError(response.message || "Failed to load test details"));
        }
      } catch (error: any) {
        console.error("Error loading test details:", error);
        const errorMessage = error.message || "An error occurred while loading test details";
        dispatch(setError(errorMessage));
      } finally {
        setPageLoading(false);
        dispatch(setLoading(false));
      }
    };

    fetchTestData();
  }, [testId, currentTest?.id, dispatch, user?.token]);

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

  // Scroll to the selected question when currentQuestion changes
  useEffect(() => {
    if (questionRefs.current[currentQuestion]) {
      questionRefs.current[currentQuestion]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentQuestion]);

  // Calculate time remaining percentage
  const timeRemainingPercentage = listeningModule?.allowedTime
    ? (timer / (listeningModule.allowedTime * 60)) * 100
    : 100;

  const handlePartChange = (partIndex: number) => {
    setCurrentPartIndex(partIndex);
    setCurrentQuestionGroup(0);
    setCurrentQuestion(1);
  };

  const handleQuestionChange = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
    setLastSelectedQuestion(questionNumber);
  };

  const handlePlayPause = () => {
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause();
      } else {
        currentAudio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentAudio) {
      const newTime = parseFloat(e.target.value);
      currentAudio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleRewind = () => {
    if (currentAudio) {
      currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 10);
    }
  };

  const handleForward = () => {
    if (currentAudio) {
      currentAudio.currentTime = Math.min(duration, currentAudio.currentTime + 10);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const handleExitTest = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }
    navigate("/dashboard");
  };

  const handleSubmitAnswer = () => {
    setTimer(0);
    console.log("Submitting answers:", answers);
    onComplete?.();
  };

  // If loading or error, show appropriate UI
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

  if (!currentTest || !listeningModule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Not Found</h1>
        <p className="text-gray-600 mb-4">The requested listening test could not be found.</p>
        <Button onClick={() => navigate("/dashboard")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Timer Section */}
      <Timer readingModule={listeningModule} timer={timer} handleExitTest={handleExitTest} timeRemainingPercentage={timeRemainingPercentage} />

      {/* Main Content */}
      <div className="flex-1" style={{ overflow: 'hidden' }}>
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-200px)]"
          style={{ overflow: 'hidden' }}
        >
          {/* Audio Player */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="rounded-none h-full overflow-hidden border-0 shadow-none">
              <CardContent className="p-6 h-full" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                {currentPartDetails && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">{currentPartDetails.partHeading}</h2>
                    {currentPartDetails.passageHeading && (
                      <div 
                        className="text-lg mb-4"
                        dangerouslySetInnerHTML={{ __html: currentPartDetails.passageHeading }}
                      />
                    )}
                    
                    {/* Audio Player */}
                    <div className="border rounded-md p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Button
                          onClick={handlePlayPause}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {isPlaying ? 'Pause' : 'Play'} Audio
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRewind}
                            className="flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="19 20 9 12 19 4 19 20"></polygon>
                              <line x1="5" y1="19" x2="5" y2="5"></line>
                            </svg>
                            10s
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleForward}
                            className="flex items-center gap-1"
                          >
                            10s
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 4 15 12 5 20 5 4"></polygon>
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs">{formatTime(currentTime)}</span>
                        <input 
                          type="range" 
                          min="0" 
                          max={duration} 
                          value={currentTime} 
                          onChange={handleSeek}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs">{formatTime(duration)}</span>
                      </div>
                      <Progress value={audioProgress} className="h-1" />
                      
                      {/* Subtitles */}
                      {currentSubtitle && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-md text-center">
                          {currentSection && (
                            <div className="text-xs text-gray-500 mb-1">{currentSection}</div>
                          )}
                          <p className="text-sm font-medium">{currentSubtitle}</p>
                        </div>
                      )}

                      {/* Transcription Section */}
                      <div className="mt-6 border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold">Audio Transcription</h3>
                          <span className="text-xs text-gray-500">Click on any text to jump to that part</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-md p-4">
                          {parsedSubtitles.map((subtitle, index) => (
                            <div 
                              key={index}
                              className={`mb-2 p-2 rounded cursor-pointer transition-colors ${
                                currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
                                  ? "bg-blue-50 border border-blue-200"
                                  : "hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                if (currentAudio) {
                                  currentAudio.currentTime = subtitle.startTime;
                                  if (!isPlaying) {
                                    currentAudio.play();
                                    setIsPlaying(true);
                                  }
                                }
                              }}
                            >
                              <div className="text-xs text-gray-500 mb-1">
                                {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                              </div>
                              <p className="text-sm">{subtitle.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Instructions */}
                    {currentPartDetails.instructions && (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: currentPartDetails.instructions }} 
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Questions */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="rounded-none h-full overflow-hidden border-0 shadow-none">
              <CardContent 
                ref={questionsContainerRef} 
                className="p-6 h-full" 
                style={{ overflowY: 'auto', overflowX: 'hidden' }}
              >
                {currentPartDetails && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">{currentPartDetails.partHeading}</h2>
                    <div 
                      className="mb-6 text-sm text-gray-600"
                      dangerouslySetInnerHTML={{ __html: currentPartDetails.instructions || '' }}
                    />
                    
                    {/* Display current question group */}
                    {currentQuestionGroupData && (
                      <div className="mb-8">
                        <h3 className="text-lg font-bold mb-2">{currentQuestionGroupData.name}</h3>
                        <div 
                          className="mb-4 text-sm text-gray-600"
                          dangerouslySetInnerHTML={{ __html: currentQuestionGroupData.instructions || '' }}
                        />
                        
                        {/* Display questions based on the question group type */}
                        {currentQuestionGroupData.type === "NoteCompletion" && (
                          <div className="border rounded-md p-4 mb-4">
                            {currentQuestionGroupData.heading && (
                              <div 
                                className="text-lg font-bold mb-4"
                                dangerouslySetInnerHTML={{ __html: currentQuestionGroupData.heading }}
                              />
                            )}
                            <div className="space-y-4">
                              {currentQuestionGroupData.content.map((item: any, index: number) => {
                                if (item.type === "heading") {
                                  return (
                                    <div key={index} className={`${item.level === 1 ? 'mt-4' : 'mt-2'}`}>
                                      <h4 
                                        className={`${
                                          item.style?.includes("bold") ? "font-bold" : ""
                                        } ${
                                          item.level === 1 ? "text-base" : "text-sm"
                                        }`}
                                      >
                                        {item.text}
                                      </h4>
                                    </div>
                                  );
                                }
                                
                                if (item.type === "bullet") {
                                  return (
                                    <div 
                                      key={index} 
                                      className={`ml-${item.level * 4} flex items-start gap-2`}
                                    >
                                      <span className="mt-1.5">•</span>
                                      <div className="flex-1 flex flex-wrap items-center gap-1">
                                        {item.content.map((contentItem: any, contentIndex: number) => {
                                          if (contentItem.type === "text") {
                                            return (
                                              <span key={contentIndex}>
                                                {contentItem.content}
                                              </span>
                                            );
                                          }
                                          if (contentItem.type === "question") {
                                            return (
                                              <div key={contentIndex} className="inline-flex items-center">
                                                <Input
                                                  type="text"
                                                  value={answers[contentItem.questionId] || ""}
                                                  onChange={(e) => handleOptionSelect(contentItem.questionId, e.target.value)}
                                                  placeholder={`Question ${contentItem.id}`}
                                                  className="w-32 h-8 px-2 py-1 text-sm"
                                                />
                                              </div>
                                            );
                                          }
                                          return null;
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                                
                                return null;
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Handle OneChoice type */}
                        {currentQuestionGroupData.type === "OneChoice" && currentQuestionGroupData.questions && (
                          currentQuestionGroupData.questions.map((question: Question) => (
                            <div 
                              key={question.questionId}
                              ref={(el) => {
                                if (el) {
                                  questionRefs.current[question.id] = el;
                                }
                              }}
                              className={`border rounded-md p-4 mb-4 ${
                                currentQuestion === question.id 
                                ? "bg-blue-50 border-blue-200" 
                                : "bg-white"
                              }`}
                              onClick={() => handleQuestionChange(question.id)}
                            >
                              <div className="flex gap-2 mb-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-white text-black border border-gray-300 rounded-full text-sm">
                                  {question.id}
                                </span>
                                <h4 className="font-medium">{question.statement}</h4>
                              </div>
                              
                              <div className="space-y-2 mt-4">
                                {question.options?.map((option: Option) => (
                                  <div key={option.id} className="flex items-start gap-2">
                                    <input
                                      type="radio"
                                      id={`question-${question.id}-option-${option.id}`}
                                      name={`question-${question.id}`}
                                      checked={answers[question.questionId] === option.letter}
                                      onChange={() => question.questionId && handleOptionSelect(question.questionId, option.letter)}
                                      className="mt-1"
                                    />
                                    <label
                                      htmlFor={`question-${question.id}-option-${option.id}`}
                                      className="text-sm"
                                    >
                                      {option.letter}. {option.content}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}

                        {/* Handle MatchingFeatures type */}
                        {currentQuestionGroupData.type === "MatchingFeatures" && (
                          <div className="border rounded-md p-4 mb-4">
                            {/* Display the list of features first */}
                            <div className="bg-gray-50 p-4 rounded-md mb-6">
                              <h4 className="font-bold mb-3">Features:</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {currentQuestionGroupData.list?.map((item: any) => (
                                  <div key={item.id} className="flex gap-2">
                                    <span className="font-bold">{item.letter}.</span>
                                    <span>{item.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Display questions with dropdowns */}
                            <div className="space-y-4">
                              {currentQuestionGroupData.matchingQuestions?.map((question: any) => (
                                <div
                                  key={question.questionId}
                                  ref={(el) => {
                                    if (el) {
                                      questionRefs.current[question.id] = el;
                                    }
                                  }}
                                  className={`flex items-start gap-4 p-4 border rounded-md ${
                                    currentQuestion === question.id
                                      ? "bg-blue-50 border-blue-200"
                                      : "bg-white"
                                  }`}
                                  onClick={() => handleQuestionChange(question.id)}
                                >
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-white text-black border border-gray-300 rounded-full text-sm flex-shrink-0">
                                    {question.id}
                                  </span>
                                  <div className="flex-1">
                                    <p className="mb-2">{question.statement}</p>
                                    <Select
                                      value={answers[question.questionId] || ""}
                                      onValueChange={(value) => handleOptionSelect(question.questionId, value)}
                                    >
                                      <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {currentQuestionGroupData.list?.map((item: any) => (
                                          <SelectItem key={item.id} value={item.letter}>
                                            {item.letter}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Handle MapLabeling type */}
                        {currentQuestionGroupData.type === "MapLabeling" && (
                          <div className="border rounded-md p-4 mb-4">
                            {/* Image container with error handling */}
                            <div className="relative mb-6 bg-gray-50 rounded-lg">
                              {currentQuestionGroupData.imageUrl ? (
                                <img
                                  src={currentQuestionGroupData.imageUrl}
                                  alt="Map for labeling"
                                  className="w-full h-auto rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="100%" height="300" viewBox="0 0 800 400"%3e%3crect fill="%23f3f4f6" width="100%" height="100%"/%3e%3ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="16" fill="%236b7280"%3eImage not available%3c/text%3e%3c/svg%3e';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                                  <p className="text-gray-500">Image placeholder</p>
                                </div>
                              )}
                            </div>

                            {/* Questions */}
                            <div className="grid gap-4">
                              {currentQuestionGroupData.content?.map((item: MapLabelingContent) => {
                                const question = currentQuestionGroupData.questions?.find(
                                  (q: Question) => q.questionId === item.questionId
                                );
                                
                                return (
                                  <div
                                    key={item.questionId}
                                    ref={(el) => {
                                      if (el && question) {
                                        questionRefs.current[question.id] = el;
                                      }
                                    }}
                                    className={`flex items-start gap-4 p-4 border rounded-md ${
                                      question && currentQuestion === question.id
                                        ? "bg-blue-50 border-blue-200"
                                        : "bg-white"
                                    }`}
                                    onClick={() => question && handleQuestionChange(question.id)}
                                  >
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-white text-black border border-gray-300 rounded-full text-sm flex-shrink-0">
                                      {item.id}
                                    </span>
                                    <div className="flex-1">
                                      {question && (
                                        <>
                                          <p className="mb-2">{question.statement}</p>
                                          <Select
                                            value={answers[item.questionId] || ""}
                                            onValueChange={(value) => handleOptionSelect(item.questionId, value)}
                                          >
                                            <SelectTrigger className="w-[200px]">
                                              <SelectValue placeholder="Select an answer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {question.options?.map((option: Option) => (
                                                <SelectItem key={option.id} value={option.letter}>
                                                  {option.letter}. {option.content}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Handle SentenceCompletion type */}
                        {currentQuestionGroupData.type === "SentenceCompletion" && currentQuestionGroupData.sentences && (
                          <div className="space-y-4">
                            {currentQuestionGroupData.sentences.map((sentence: any, sentenceIndex: number) => (
                              <div key={sentenceIndex} className="border rounded-md p-4">
                                {sentence.items.map((item: any, itemIndex: number) => {
                                  if (item.type === "text") {
                                    return <span key={itemIndex}>{item.content}</span>;
                                  } else if (item.type === "select") {
                                    const question = currentQuestionGroupData.questions?.find(
                                      (q: Question) => q.id === item.questionId
                                    );
                                    return (
                                      <span key={itemIndex} className="inline-block mx-1">
                                        <Select
                                          value={answers[item.questionId] || ""}
                                          onValueChange={(value) => handleOptionSelect(item.questionId, value)}
                                        >
                                          <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select an answer" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {question?.options?.map((option: Option) => (
                                              <SelectItem key={option.id} value={option.letter}>
                                                {option.letter}. {option.content}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </span>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Handle ShortAnswer type */}
                        {currentQuestionGroupData.type === "ShortAnswer" && currentQuestionGroupData.questions && (
                          currentQuestionGroupData.questions.map((question: Question) => (
                            <div
                              key={question.questionId}
                              ref={(el) => {
                                if (el) {
                                  questionRefs.current[question.id] = el;
                                }
                              }}
                              className={`border rounded-md p-4 mb-4 ${
                                currentQuestion === question.id
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-white"
                              }`}
                              onClick={() => handleQuestionChange(question.id)}
                            >
                              <div className="flex gap-2 mb-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-white text-black border border-gray-300 rounded-full text-sm">
                                  {question.id}
                                </span>
                                <h4 className="font-medium">{question.statement}</h4>
                              </div>
                              <Input
                                type="text"
                                value={answers[question.questionId] || ""}
                                onChange={(e) => question.questionId && handleOptionSelect(question.questionId, e.target.value)}
                                placeholder="Type your answer here..."
                                className="mt-2"
                              />
                            </div>
                          ))
                        )}

                        {/* Handle SummaryCompletion type */}
                        {currentQuestionGroupData.type === "SummaryCompletion" && (
                          <div className="border rounded-md p-4 mb-4">
                            {currentQuestionGroupData.heading && (
                              <h3 
                                className="text-lg font-semibold mb-4"
                                dangerouslySetInnerHTML={{ __html: currentQuestionGroupData.heading }}
                              />
                            )}
                            <div className="flex flex-wrap items-center">
                              {currentQuestionGroupData.content?.map((item: ContentItem, index: number) => {
                                if (item.type === "text") {
                                  return (
                                    <span key={index} className="mr-1">
                                      {item.content}
                                    </span>
                                  );
                                } else if (item.type === "question") {
                                  const question = currentQuestionGroupData.questions?.find(
                                    (q: Question) => q.questionId === item.questionId
                                  );
                                  
                                  return (
                                    <Select
                                      key={index}
                                      value={answers[item.questionId] || ""}
                                      onValueChange={(value) => handleOptionSelect(item.questionId, value)}
                                    >
                                      <SelectTrigger className="w-[200px] mx-2 my-1">
                                        <SelectValue placeholder="Select answer" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {question?.options?.map((option: Option) => (
                                          <SelectItem 
                                            key={option.id} 
                                            value={option.letter}
                                          >
                                            {option.letter}. {option.content}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-gray-50 p-2 sticky bottom-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2 overflow-x-auto">
            {listeningModule.partDetails?.map((part, index) => (
              <Button
                key={part.id}
                variant={currentPartIndex === index ? "default" : "outline"}
                onClick={() => handlePartChange(index)}
                className="text-sm"
              >
                {part.partHeading}
              </Button>
            ))}
          </div>
          
          {/* Submit button positioned in the footer */}
          <Button variant="default" size="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmitAnswer}>
            Submit Answers
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1 overflow-x-auto">
          {currentPartDetails?.question_groups?.map((group, groupIndex) => {
            // Calculate the actual number of questions if not provided
            const noOfQuestions = group.noOfQuestions || 
              (group.questions ? group.questions.length : 0);
            
            // Ensure startFrom is a number, default to previous group's end + 1
            const startFrom = group.startFrom || 
              (groupIndex > 0 && currentPartDetails.question_groups 
                ? (currentPartDetails.question_groups[groupIndex - 1]?.startFrom || 0) + 
                   (currentPartDetails.question_groups[groupIndex - 1]?.noOfQuestions || 0)
                : 1);
            
            return (
              <div key={groupIndex} className="flex gap-1 mr-2">
                <span className="text-xs text-gray-500 flex items-center">{group.name}:</span>
                {Array.from({ length: noOfQuestions }).map((_, i) => {
                  const qNum = startFrom + i;
                  const questionKey = `${currentPartDetails.id}_${qNum}`;
                  const isAnswered = answers[questionKey] !== undefined;
                  const isCurrentQuestion = currentQuestion === qNum;
                  
                  return (
                    <Button
                      key={qNum}
                      variant={isCurrentQuestion ? "default" : "outline"}
                      onClick={() => {
                        setCurrentQuestionGroup(groupIndex);
                        handleQuestionChange(qNum);
                      }}
                      size="sm"
                      className={`w-8 h-8 p-0 text-xs ${
                        isAnswered 
                        ? "bg-green-100 border-green-500" 
                        : ""
                      } ${
                        isCurrentQuestion && !isAnswered
                        ? "bg-blue-100 border-blue-500"
                        : ""
                      }`}
                    >
                      {qNum}
                    </Button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 