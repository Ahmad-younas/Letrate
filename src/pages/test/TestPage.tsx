import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Maximize, Minimize } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import ReadingTest from '../reading';
import ListeningTest from '../listening';
import WritingTest from '../writing';
import { useAuth } from "@/contexts/AuthContext";

const TestPage = () => {
  const { user } = useAuth();
  const { testId } = useParams();
  const navigate = useNavigate();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const dispatch = useDispatch();
  const { currentTest, isLoading, error } = useSelector((state: RootState) => state.test);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [showInstructions, setShowInstructions] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("currentTest",currentTest);
  console.log("testId", testId);
  // Fullscreen functions
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(err => console.error(`Error attempting to enable fullscreen: ${err.message}`));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(err => console.error(`Error attempting to exit fullscreen: ${err.message}`));
      }
    }
  };

  // Listen for fullscreen change events 
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Start the test
  const handleStartTest = () => {
    setShowInstructions(false);
  };



  // Handle test component completion
  const handleTestComplete = () => {
    navigate("/dashboard");
  };

  if ( isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!currentTest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Not Found</h1>
        <p className="text-gray-600 mb-4">The requested test could not be found.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  // Render specific test component based on module name
  if (!showInstructions) {
    // Check if currentTest itself is a module
    const isModule = currentTest.isModule 
    console.log("id",currentTest.id)

    if (isModule) {
      const moduleName = currentTest.name.toLowerCase();
      console.log("moduleName",moduleName)
      
      if (moduleName === 'academic-reading' || (moduleName.includes('academic') && moduleName.includes('reading'))) {
        return <ReadingTest test={currentTest} onComplete={handleTestComplete} />;
      } else if (moduleName === 'academic-listening' || (moduleName.includes('academic') && moduleName.includes('listening'))) {
        return <ListeningTest test={currentTest} onComplete={handleTestComplete} />;
      } else if (moduleName === 'academic-writing' || (moduleName.includes('academic') && moduleName.includes('writing'))) {
        return <WritingTest test={currentTest} onComplete={handleTestComplete} />;
      }
    } else if (!isModule) {
      console.log("Inside else if - not a module but may contain modules");
      if (currentTest.modules && currentTest.modules.length > 0) {
        const currentModule = currentTest.modules[currentModuleIndex];
        const moduleName = currentModule.name.toLowerCase();
  
        // Function to handle module completion
        const handleModuleComplete = () => {
          if (currentModuleIndex < currentTest.modules.length - 1) {
            // Move to the next module
            setCurrentModuleIndex(currentModuleIndex + 1);
          } else {
            // All modules completed, call the test completion handler
            handleTestComplete();
          }
        };

        if (moduleName === 'academic-reading' || (moduleName.includes('academic') && moduleName.includes('reading'))) {
          return <ReadingTest test={currentModule} onComplete={handleModuleComplete} />;
        } else if (moduleName === 'academic-listening' || (moduleName.includes('academic') && moduleName.includes('listening'))) {
          return <ListeningTest test={currentModule} onComplete={handleModuleComplete} />;
        } else if (moduleName === 'academic-writing' || (moduleName.includes('academic') && moduleName.includes('writing'))) {
          return <WritingTest test={currentModule} onComplete={handleModuleComplete} />;
        }
      }
    }
    
    // Default fallback if no specific module is detected
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Unsupported Test Type</h1>
        <p className="text-gray-600 mb-4">This test type is not currently supported.</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  // Show instructions
  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="font-medium">Letrate Module</h1>
          <span className="text-sm">{currentTest.name || "IELTS Test"}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>{currentTest?.allowedTime} {currentTest?.timeUnit} left</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Exit Test
            </Button>
            <Button variant="secondary" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <>
                  <Minimize className="h-4 w-4 mr-1" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize className="h-4 w-4 mr-1" />
                  Fullscreen
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Instructions View */}
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full bg-white">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">{currentTest.source || "Letrate Module"}</h2>
            <h3 className="text-xl font-bold mb-6">{currentTest.name || "IELTS Practice Test"}</h3>
          </div>

          <div>
            <h3 className="font-bold mb-2">{currentTest?.name}</h3>
            <p className="mb-4">Time: {currentTest?.allowedTime} {currentTest?.timeUnit}</p>
          </div>

          {currentTest.officialInstructions   && currentTest?.officialInstructions.length > 0 ? (
            <>
              <div>
                <h3 className="font-bold mb-4">Official Instructions to candidates</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {currentTest?.officialInstructions.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4">Information for candidates</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {currentTest?.informationForCandidates && currentTest?.informationForCandidates.map((info: string, index: number) => (
                    <li key={index} className={info.includes("MUST") ? "text-red-500 font-bold" : ""}>{info}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-bold mb-4">Official Instructions to candidates</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Do not open this question paper until you are told to do so.</li>
                  <li>Write your name and candidate number in the spaces at the top of this page.</li>
                  <li>Read the instructions for each part of the paper carefully.</li>
                  <li>Answer all the questions.</li>
                  <li>Write your answers on the answer sheet. Use a pencil.</li>
                  <li>You <span className="font-bold">must</span> complete the answer sheet within the time limit.</li>
                  <li>At the end of the test, hand in both this question paper and your answer sheet.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4">Information for candidates</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>There are <span className="font-bold">{currentTest?.totalQuestions || 40}</span> questions.</li>
                  <li>Each question carries one mark.</li>
                  <li className="text-red-500 font-bold">YOU MUST FILL IN YOUR ANSWER SHEET!</li>
                  <li>To view the answer sheet, click VIEW ANSWER SHEET at the bottom of the paper.</li>
                </ul>
              </div>
            </>
          )}

          <div className="text-sm text-gray-600">
            Instruction Source: <a href="#" className="text-blue-500">British Council {currentTest?.name} PDF</a>
          </div>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleStartTest}
            >
              START TEST
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestPage; 