import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { api } from "@/utils/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface ModuleResult {
  id: string;
  userId: string;
  moduleId: string;
  band: number;
  totalQuestions: number;
  correctAnswers: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get test data from Redux store
  const { currentTest } = useSelector((state: RootState) => state.test);
  
  const [result, setResult] = useState<ModuleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResults = async () => {

        console.log("Inside");
    //   if (!user?.token) {
    //     setErrorMessage("Authentication required");
    //     setLoading(false);
    //     return;
    //   }

      try {
        setLoading(true);
        
        // Get module ID from Redux store first, then URL params, then path
        let moduleId = currentTest?.id;
        
        console.log("Using module ID:", moduleId);
        
        if (!moduleId) {
          setErrorMessage("Module ID not found");
          setLoading(false);
          return;
        }

        // Make API request to get module results
        const response = await api.get(`/api/modules/${moduleId}/result`, user?.token || "");
        console.log("API response:", response);
        if (response.status === 200) {
          setResult(response.data);
        } else {
          setErrorMessage(response.message || "Failed to load test results");
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error("Error loading test results:", error);
        setErrorMessage(error.message || "An error occurred while loading test results");
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [ user?.token, currentTest?.id]);

  // Helper function to determine band color
  const getBandColor = (band: number) => {
    if (band >= 8) return "text-green-600";
    if (band >= 6.5) return "text-blue-600";
    if (band >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function to calculate percentage
  const calculatePercentage = (correct: number, total: number) => {
    return Math.round((correct / total) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
        </div>
      </Layout>
    );
  }

  if (errorMessage) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <Button onClick={() => navigate("/dashboard")}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  if (!result) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Results Not Found</h1>
          <p className="text-gray-600 mb-4">The requested test results could not be found.</p>
          <Button onClick={() => navigate("/dashboard")}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  const currentDate = new Date(result.createdAt).toLocaleDateString();
  const percentageCorrect = calculatePercentage(result.correctAnswers, result.totalQuestions);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
            <p className="text-gray-600">Completed on {currentDate}</p>
          </div>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        {/* Band Score Card */}
        <Card className="mb-8">
          <CardHeader className="bg-gray-50">
            <CardTitle>IELTS Band Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className={`text-6xl font-bold mb-2 ${getBandColor(result.band)}`}>
                {result.band}
              </div>
              <p className="text-gray-600">Your band score</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="mb-8">
          <CardHeader className="bg-gray-50">
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Correct Answers */}
              <div className="flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-2">Correct Answers</p>
                <p className="text-4xl font-bold text-blue-600">
                  {result.correctAnswers}/{result.totalQuestions}
                </p>
              </div>
              
              {/* Percentage */}
              <div className="flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-2">Percentage</p>
                <p className="text-4xl font-bold text-green-600">
                  {percentageCorrect}%
                </p>
              </div>

              {/* Module ID */}
              <div className="flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-2">Module ID</p>
                <p className="text-xl font-bold text-gray-600">
                  {result.moduleId}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-8">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${percentageCorrect}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Information */}
        <Card className="mb-8">
          <CardHeader className="bg-gray-50">
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Test ID</p>
                <p className="font-medium">{result.id}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium">{result.createdBy}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(result.createdAt).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="font-medium">{new Date(result.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-center mt-12 space-x-4">
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
} 