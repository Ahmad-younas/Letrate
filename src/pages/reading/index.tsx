import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Timer from "@/lib/Timer";
import {  AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { setCurrentTest, setLoading, setError } from "@/store/features/testSlice";
import { Question, Option } from "@/store/features/testSlice";
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle 
} from "@/components/ui/resizable";

// Define content item interfaces
interface ContentItem {
  type: string;
  id?: number;
  questionId?: string;
}

interface TextContent extends ContentItem {
  type: "text";
  content: string;
}

interface QuestionContent extends ContentItem {
  type: "question";
  id: number;
  questionId: string;
  inputType: string;
}

interface ListItem {
  id: number;
  letter: string ;
  text: string;
  number: number;
}

interface MatchingQuestion {
  id: number;
  questionId: string;
  statement: string;
}

interface QuestionGroup {
  id: string;
  name: string;
  instructions: string;
  type: string;
  noOfQuestions: number;
  startFrom: number;
  questions?: Question[];
  content?: ContentItem[];
  sentences?: any[];
  list?: ListItem[];
  matchingQuestions?: MatchingQuestion[];
}

// Define sentence item interfaces
interface ListNumberItem {
  type: "list-number";
  content: string;
}

interface TextItem {
  type: "text";
  content: string;
}

interface QuestionItem {
  type: "question";
  id: number;
  questionId: string;
  inputType: string;
}

type SentenceItem = ListNumberItem | TextItem | QuestionItem;

interface Sentence {
  sentence: SentenceItem[];
}

// Type guard functions
function isTextContent(item: ContentItem): item is TextContent {
  return item.type === "text";
}

function isQuestionContent(item: ContentItem): item is QuestionContent {
  return item.type === "question";
}

interface ReadingTestProps {
  onComplete?: () => void;
  test?: any; // Use any for now, can be typed more strictly if needed
}

export default function ReadingTest({ onComplete, test }: ReadingTestProps) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  console.log("user:", user);
  
  // Use the passed test prop if available, otherwise get from Redux
  const reduxTestData = useSelector((state: RootState) => state.test);
  const { isLoading, error } = reduxTestData;
  const currentTest = test;
  console.log("currentTest",currentTest);
  
  
  
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionGroup, setCurrentQuestionGroup] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [lastSelectedQuestion, setLastSelectedQuestion] = useState<number | null>(null);
  const [timer, setTimer] = useState(60); // Default 60 minutes    
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pageLoading, setPageLoading] = useState(true);

  // Add a ref to scroll to selected question
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set timer based on module data when available
  useEffect(() => {
    if (currentTest?.allowedTime && currentTest.timeUnit === "minutes") {
      setTimer(currentTest.allowedTime * 60);
    }
  }, [currentTest]);

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
        if ( prevTimer <= 0) {
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
  const timeRemainingPercentage = currentTest?.allowedTime
    ? (timer / (currentTest.allowedTime * 60)) * 100
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

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const handleExitTest = () => {
    navigate("/dashboard");
  };

  const handleSubmitAnswer = () => {
    setTimer(0);
    
    // Format answers for submission in the required format
    const studentAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      userId: user?.id , // Use actual user ID or fallback
      questionId: questionId,
      studentAnswer: answer
    }));
    
    console.log("Submitting answers:", JSON.stringify({ studentAnswers: studentAnswers }, null, 2));
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

  if (!currentTest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Not Found</h1>
        <p className="text-gray-600 mb-4">The requested reading test could not be found.</p>
        <Button onClick={() => navigate("/dashboard")}>Go Back</Button>
      </div>
    );
  }

  // Get current part data
  const currentPartDetails = currentTest.partDetails?.[currentPartIndex];
  // Get current question group data
  const currentQuestionGroupData = currentPartDetails?.question_groups?.[currentQuestionGroup] as QuestionGroup | undefined;

  return (
    <div className="flex flex-col h-screen">
      {/* Timer Section */}
      <Timer readingModule={currentTest} timer={timer} handleExitTest={handleExitTest} timeRemainingPercentage={timeRemainingPercentage} />

      {/* Main Content */}
      <div className="flex-1" style={{ overflow: 'hidden' }}>
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-200px)]"
          style={{ overflow: 'hidden' }}
        >
          {/* Reading Passage */}
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
                    {currentPartDetails.passage && (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: currentPartDetails.passage }} 
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
                      dangerouslySetInnerHTML={{ __html: currentPartDetails.instructions }}
                    />
                    
                    {/* Display current question group */}
                    {currentQuestionGroupData && (
                      <div className="mb-8">
                        <h3 className="text-lg font-bold mb-2">{currentQuestionGroupData.name}</h3>
                        <div 
                          className="mb-4 text-sm text-gray-600"
                          dangerouslySetInnerHTML={{ __html: currentQuestionGroupData.instructions }}
                        />
                        
                        {/* Display questions based on the question group type */}
                        {currentQuestionGroupData.type === "TrueFalseNotGiven" && currentQuestionGroupData.questions && (
                          currentQuestionGroupData.questions.map((question, index) => {
                            console.log("Question:", question);
                            // Create a more reliable question ID
                            const questionFullId = question.questionId || question.id;
                            console.log("questionFullId:", questionFullId);
                            return (
                              <div 
                              key={question.questionId}
                                ref={(el) => {
                                  if (el) {
                                  questionRefs.current[question.id] = el;
                                  }
                                }}
                                className={`border rounded-md p-4 mb-4 ${
                                currentQuestion === question.id 
                                ? "bg-blue-50 border-blue-200 fade-in-5" 
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
                                {["TRUE", "FALSE"].map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-start gap-2">
                                      <input
                                      type="radio"
                                      id={`question-${question.id}-option-${optionIndex}`}
                                      name={`question-${question.id}`}
                                      checked={answers[questionFullId] === option}
                                      onChange={() => handleOptionSelect(questionFullId.toString(), option)}
                                        className="mt-1"
                                      />
                                      <label
                                      htmlFor={`question-${question.id}-option-${optionIndex}`}
                                        className="text-sm"
                                      >
                                      {option}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}
                        
                        {/* Handle SummaryCompletion type */}
                        {currentQuestionGroupData.type === "SummaryCompletion" && currentQuestionGroupData.content && (
                          <div className="border rounded-md p-4 mb-4">
                            <div className="flex flex-wrap items-center">
                              {currentQuestionGroupData.content.map((item: ContentItem, index: number) => {
                                if (isTextContent(item)) {
                                  return <span key={index} className="mr-1">{item.content}</span>;
                                } else if (isQuestionContent(item)) {
                                  return (
                                    <input
                                      key={index}
                                      type="text"
                                      className="border border-gray-300 rounded p-1 w-24 mx-1 my-1"
                                      value={answers[item.questionId] || ''}
                                      onChange={(e) => item.questionId && handleOptionSelect(item.questionId, e.target.value)}
                                      placeholder={`Type Answer`}
                                    />
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

                        {/* Handle SentenceCompletion type */}
                        {currentQuestionGroupData.type === "SentenceCompletion" && (
                          <div className="border rounded-md p-4 mb-4">
                            <div className="flex flex-col gap-4">
                              {currentQuestionGroupData.sentences?.map((sentenceObj: Sentence, sentenceIndex: number) => (
                                <div 
                                  key={sentenceIndex} 
                                  className="flex items-start gap-2"
                                >
                                  {sentenceObj.sentence.map((item: SentenceItem, itemIndex: number) => {
                                    if (item.type === "list-number") {
                                      return (
                                        <span key={itemIndex} className="inline-flex items-center justify-center w-6 h-6 bg-white text-black border border-gray-300 rounded-full text-sm flex-shrink-0">
                                          {item.content}
                                        </span>
                                      );
                                    } else if (item.type === "text") {
                                      return <span key={itemIndex} className="mr-1">{item.content}</span>;
                                    } else if (item.type === "question") {
                                      return (
                                        <input
                                          key={itemIndex}
                                          type="text"
                                          className="border border-gray-300 rounded p-1 w-24 mx-1"
                                          value={answers[item.questionId] || ''}
                                          onChange={(e) => item.questionId && handleOptionSelect(item.questionId, e.target.value)}
                                          placeholder={`Type Answer`}
                                        />
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Handle MatchingFeatures type */}
                        {currentQuestionGroupData.type === "MatchingFeatures" && (
                          <div className="border rounded-md p-4 mb-4">
                            <div className="flex flex-col gap-4">
                              {/* Display list options first */}
                              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md">
                                {currentQuestionGroupData.list?.map((item) => (
                                  <div key={item.id} className="flex gap-2">
                                    <span className="font-bold">{item.letter}.</span>
                                    <span>{item.text}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Display questions with dropdowns */}
                              {currentQuestionGroupData.matchingQuestions?.map((question) => (
                                <div 
                                  key={question.questionId}
                                  className="flex gap-4 items-start"
                                >
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-white text-black border border-gray-300 rounded-full text-sm flex-shrink-0">
                                    {question.id}
                                  </span>
                                  <div className="flex-1">
                                    <p className="mb-2">{question.statement}</p>
                                    <select
                                      className="border border-gray-300 rounded p-1"
                                      value={answers[question.questionId] || ''}
                                      onChange={(e) => question.questionId && handleOptionSelect(question.questionId, e.target.value)}
                                    >
                                      <option value="">Select an answer</option>
                                      {currentQuestionGroupData.list?.map((item) => (
                                        <option key={item.id} value={item.letter}>
                                          {item.letter}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Handle MatchingHeadings type */}
                        {currentQuestionGroupData.type === "MatchingHeadings" && (
                          <div className="border rounded-md p-4 mb-4">
                            <div className="flex flex-col gap-4">
                              {/* Display list options first */}
                              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md">
                                {currentQuestionGroupData.list?.map((item) => (
                                  <div key={item.id} className="flex gap-2">
                                    <span className="font-bold">{item.number}.</span>
                                    <span>{item.text}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Display questions with dropdowns */}
                              {currentQuestionGroupData.matchingQuestions?.map((question) => (
                                <div 
                                  key={question.questionId}
                                  className="flex gap-4 items-start"
                                >
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-white text-black border border-gray-300 rounded-full text-sm flex-shrink-0">
                                    {question.id}
                                  </span>
                                  <div className="flex-1">
                                    <p className="mb-2">{question.statement}</p>
                                    <select
                                      className="border border-gray-300 rounded p-1"
                                      value={answers[question.questionId] || ''}
                                      onChange={(e) => question.questionId && handleOptionSelect(question.questionId, e.target.value)}
                                    >
                                      <option value="">Select an answer</option>
                                      {currentQuestionGroupData.list?.map((item) => (
                                        <option key={item.id} value={item.number}>
                                          {item.number}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ))}
                              
                            </div>
                          </div>
                        )}

                         {/* Handle ShortAnswer type */}
                        {currentQuestionGroupData.type === "ShortAnswers" && (
                          <div className="border rounded-md p-4 mb-4">
                            <div className="flex flex-col gap-4">
                              {currentQuestionGroupData.questions?.map((question) => (
                                <div 
                                  key={question.questionId}
                                  className="flex gap-4 items-start"
                                >
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-white text-black border border-gray-300 rounded-full text-sm flex-shrink-0">
                                    {question.id}
                                  </span>
                                  <div className="flex-1">
                                    <p className="mb-2">{question.statement}</p>
                                    <input
                                      type="text"
                                      className="border border-gray-300 rounded p-2 w-full"
                                      value={answers[question.questionId] || ''}
                                      onChange={(e) => question.questionId && handleOptionSelect(question.questionId, e.target.value)}
                                      placeholder="Type your answer here..."
                                    />
                                  </div>
                                </div>
                              ))}
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
            {currentTest.partDetails ?.map((part:any, index:any) => (
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
          <Button variant="default" size="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSubmitAnswer()}>
            Submit Answers
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1 overflow-x-auto">
          {currentPartDetails?.question_groups?.map((group: { name: string, noOfQuestions: number, startFrom: number }, groupIndex: number) => (
            <div key={groupIndex} className="flex gap-1 mr-2">
              <span className="text-xs text-gray-500 flex items-center">{group.name}:</span>
              {Array.from({ length: group.noOfQuestions }).map((_, i) => {
                const qNum = group.startFrom + i;
                return (
            <Button
                    key={qNum}
                    variant={currentQuestion === qNum ? "default" : "outline"}
                    onClick={() => {
                      setCurrentQuestionGroup(groupIndex);
                      handleQuestionChange(qNum);
                    }}
              size="sm"
                    className={`w-8 h-8 p-0 text-xs ${
                      answers[`${currentPartDetails.id}_${qNum}`] 
                      ? "bg-green-100 border-green-500" 
                      : ""
                    }`}
                  >
                    {qNum}
            </Button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
