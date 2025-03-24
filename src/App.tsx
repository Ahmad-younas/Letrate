import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/login";
import SignUpPage from "./pages/auth/signup";
import Dashboard from "./pages/dashboard";
import ReadingTest from "./pages/reading"; // Fixed import path
import WritingTest from "./pages/writing";
import { Layout } from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/reading-test" element={<ReadingTest />} />
        <Route path="/courses" element={<Layout><div className="p-8">Courses Page</div></Layout>} />
        <Route path="/ai-conversations" element={<Layout><div className="p-8">AI Conversations Page</div></Layout>} />
        <Route path="/writing-exercises" element={<WritingTest />} />
        <Route path="/pronunciation" element={<Layout><div className="p-8">Pronunciation Page</div></Layout>} />
        <Route path="/dictation" element={<Layout><div className="p-8">Dictation/Shadowing Page</div></Layout>} />
        <Route path="/flashcards" element={<Layout><div className="p-8">Flashcards Page</div></Layout>} />
        <Route path="/learn-videos" element={<Layout><div className="p-8">Learn Videos Page</div></Layout>} />
        <Route path="/ielts" element={<Layout><div className="p-8">IELTS Page</div></Layout>} />
        <Route path="/tools" element={<Layout><div className="p-8">Tools Page</div></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
