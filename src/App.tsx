import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/login";
import SignUpPage from "./pages/auth/signup";
import Dashboard from "./pages/dashboard";
import ReadingTest from "./pages/reading"; // Fixed import path
import WritingTest from "./pages/writing";
import AdminDashboard from "./pages/admin/Dashboard";
import { Layout } from "./components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requiredPermissions={["TENANT_READ", "USER_READ"]}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reading-test" element={
            <ProtectedRoute>
              <ReadingTest />
            </ProtectedRoute>
          } />

          <Route path="/courses" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-8">Courses Page</div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/ai-conversations" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-8">AI Conversations Page</div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/writing-exercises" element={
            <ProtectedRoute>
              <WritingTest />
            </ProtectedRoute>
          } />

          <Route path="/pronunciation" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-8">Pronunciation Page</div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/dictation" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-8">Dictation/Shadowing Page</div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/flashcards" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-8">Flashcards Page</div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/learn-videos" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-8">Learn Videos Page</div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/ielts" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-8">IELTS Page</div>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/tools" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-8">Tools Page</div>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
