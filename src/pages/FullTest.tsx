import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ReadingTest from './reading';
import ListeningTest from './listening';
import WritingTest from './writing';
import TestPage from './test/TestPage';
import { useNavigate } from 'react-router-dom';
type TestComponent = 'reading' | 'listening' | 'writing' | null;

export default function FullTest() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentComponent, setCurrentComponent] = useState<TestComponent>(null);
  
 

  // Handle test completion for each component
  const handleComponentComplete = (component: TestComponent) => {
    switch(component) {
      case 'reading':
        setCurrentComponent('listening');
        setShowInstructions(true);
        break;
      case 'listening':
        setCurrentComponent('writing');
        setShowInstructions(true);
        break;
      case 'writing':
        // Handle test completion
        navigate('/dashboard');
        break;
    }
  };

  // Start the test
  const handleStartTest = () => {
    setShowInstructions(false);
    setCurrentComponent('reading');
  };



  // Render current test component
  switch(currentComponent) {
    case 'reading':
      return <ReadingTest onComplete={() => handleComponentComplete('reading')} />;
    case 'listening':
      return <ListeningTest onComplete={() => handleComponentComplete('listening')} />;
    case 'writing':
      return <WritingTest onComplete={() => handleComponentComplete('writing')} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Button onClick={handleStartTest}>Start Test</Button>
        </div>
      );
  }
} 