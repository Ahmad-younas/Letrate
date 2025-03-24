import { useState, useEffect, useRef } from "react";
import { testData } from "@/ReadingData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle 
} from "@/components/ui/resizable";

// Define types for our questions and options
interface Option {
  ID: number;
  content: string;
}

interface Question {
  questionNo: number | string;
  questionId?: string;
  statement: string;
  options?: Option[];
}

interface QuestionGroup {
  instructions: string;
  title: string;
  noOfQuestions: number;
  startFrom?: number;
  type: string;
  subtype?: string;
  questions: Question[];
}

export default function ReadingTest() {
  const navigate = useNavigate();
  const [currentPart, setCurrentPart] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timer, setTimer] = useState(testData.module.allowedTime * 60); // Convert minutes to seconds
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Add a ref to scroll to selected question
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // Scroll to the selected question when currentQuestion changes
  useEffect(() => {
    if (questionRefs.current[currentQuestion]) {
      questionRefs.current[currentQuestion]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentQuestion]);

  // Format time as MM:SS:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate time remaining percentage
  const timeRemainingPercentage =
    (timer / (testData.module.allowedTime * 60)) * 100;

  // Get current part data
  const currentPartData = testData.module.partDetails.find(
    (part) => part.ID === currentPart
  );

  // Get question groups for current part
  const questionGroups = (currentPartData?.question_groups || []) as QuestionGroup[];

  const handlePartChange = (partId: number) => {
    setCurrentPart(partId);
    setCurrentQuestion(1); // Reset to first question when changing parts
  };

  const handleQuestionChange = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
  };

  const handleOptionSelect = (questionId: string | number, optionId: number) => {
    const key = questionId.toString();
    setAnswers({
      ...answers,
      [key]: optionId.toString(),
    });
  };

  // Generate array of question numbers for the current part
  const generateQuestionNumbers = () => {
    const numbers = [];
    let questionCount = 0;
    
    questionGroups.forEach(group => {
      questionCount += group.questions.length;
    });
    
    for (let i = 1; i <= questionCount; i++) {
      numbers.push(i);
    }
    
    return numbers;
  };

  const handleExitTest = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Timer Section */}
      <div className="bg-navy-900 text-white p-2 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 w-1/4">
            <span className="font-bold">{testData.module.name} Test</span>
          </div>
          
          <div className="flex justify-center w-1/2">
            <div className="flex items-center gap-2 bg-navy-800 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-lg">{formatTime(timer)}</span>
              <span className="text-xs">Time remaining</span>
            </div>
          </div>
          
          <div className="w-1/4 flex justify-end items-center gap-4">
            <span className="text-sm">{testData.module.totalQuestions} Questions | {testData.module.totalParts} Parts</span>
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
          {/* Reading Passage */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="rounded-none h-full overflow-hidden border-0 shadow-none">
              <CardContent className="p-6 h-full" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                {currentPartData?.content?.text}
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
                {currentPartData && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">{currentPartData.name}</h2>
                    <p className="mb-6 text-sm text-gray-600">{currentPartData.instructions}</p>
                    
                    {/* Display all question groups */}
                    {questionGroups.map((group, groupIndex: number) => {
                      let questionCounter = 0;
                      // Calculate starting question number for this group
                      questionGroups.slice(0, groupIndex).forEach((prevGroup) => {
                        questionCounter += prevGroup.questions.length;
                      });
                      
                      return (
                        <div key={groupIndex} className="mb-8">
                          <h3 className="text-lg font-bold mb-2">{group.title}</h3>
                          <p className="mb-4 text-sm text-gray-600">{group.instructions}</p>
                          
                          {/* Display all questions in this group */}
                          {group.questions.map((question: Question, index: number) => {
                            const questionNumber = questionCounter + index + 1;
                            const isActive = currentQuestion === questionNumber;
                            
                            return (
                              <div 
                                key={questionNumber}
                                ref={(el) => {
                                  if (el) {
                                    questionRefs.current[questionNumber] = el;
                                  }
                                }}
                                className={`border rounded-md p-4 mb-4 ${
                                  isActive ? "ring-2 ring-blue-500 bg-blue-50" : ""
                                }`}
                                onClick={() => handleQuestionChange(questionNumber)}
                              >
                                <div className="flex gap-2 mb-2">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 ${
                                    isActive ? "bg-blue-600 text-white" : "bg-white text-black border border-gray-300"
                                  } rounded-full text-sm`}>
                                    {questionNumber}
                                  </span>
                                  <h4 className="font-medium">{question.statement}</h4>
                                </div>
                                
                                <div className="space-y-2 mt-4">
                                  {question.options?.map((option: Option) => (
                                    <div key={option.ID} className="flex items-start gap-2">
                                      <input
                                        type={group.subtype === "Radio" ? "radio" : "checkbox"}
                                        id={`question-${questionNumber}-option-${option.ID}`}
                                        name={`question-${questionNumber}`}
                                        checked={answers[question.questionId || questionNumber.toString()] === option.ID.toString()}
                                        onChange={() => handleOptionSelect(question.questionId || questionNumber, option.ID)}
                                        className="mt-1"
                                      />
                                      <label
                                        htmlFor={`question-${questionNumber}-option-${option.ID}`}
                                        className="text-sm"
                                      >
                                        {option.content}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
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
            {testData.module.partDetails.map((part) => (
              <Button
                key={part.ID}
                variant={currentPart === part.ID ? "default" : "outline"}
                onClick={() => handlePartChange(part.ID)}
                className="text-sm"
              >
                Part {part.ID}
              </Button>
            ))}
          </div>
          
          {/* Submit button positioned in the footer */}
          <Button variant="default" size="default" className="bg-blue-600 hover:bg-blue-700 text-white">
            Submit Answers
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1 overflow-x-auto">
          {generateQuestionNumbers().map((num) => (
            <Button
              key={num}
              variant={currentQuestion === num ? "default" : "outline"}
              onClick={() => handleQuestionChange(num)}
              size="sm"
              className={`w-8 h-8 p-0 text-xs ${currentQuestion !== num ? "text-black !text-black hover:text-black" : ""}`}
              style={currentQuestion !== num ? {color: 'black'} : {}}
            >
              {num}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
