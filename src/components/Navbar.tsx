import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              LETRATE
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/courses">
                <Button variant="ghost">Courses</Button>
              </Link>
              <Link to="/ai-conversations">
                <Button variant="ghost">AI Conversations</Button>
              </Link>
              <Link to="/writing-exercises">
                <Button variant="ghost">Writing Exercises</Button>
              </Link>
              <Link to="/pronunciation">
                <Button variant="ghost">Pronunciation</Button>
              </Link>
              <Link to="/dictation">
                <Button variant="ghost">Dictation/Shadowing</Button>
              </Link>
              <Link to="/flashcards">
                <Button variant="ghost">Flashcards</Button>
              </Link>
              <Link to="/learn-videos">
                <Button variant="ghost">Learn Videos</Button>
              </Link>
              <Link to="/ielts">
                <Button variant="ghost">IELTS</Button>
              </Link>
              <Link to="/tools">
                <Button variant="ghost">Tools</Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 