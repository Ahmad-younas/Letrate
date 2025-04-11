import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, MessageSquare, Activity, Mail, Upload, Loader2, LogOut, Clock, FileText, Plus, Search, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import * as XLSX from 'xlsx';
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from 'react-redux';

const AdminDashboard = () => {
  const { user, logout, getTokenExpirationTime } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emails, setEmails] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [fileEmails, setFileEmails] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [fileSuccess, setFileSuccess] = useState<string>("");
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Test state
  const [tests, setTests] = useState<any[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTask, setFilterTask] = useState("all");
  const [testError, setTestError] = useState<string>("");
  const [isLoadingTestDetails, setIsLoadingTestDetails] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testDetailsError, setTestDetailsError] = useState<string>("");

  // Fetch tests on component mount
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoadingTests(true);
        setTestError("");
        
        // Fetch tests from API
        const response = await api.get("/api/tests", user?.token || "");
        console.log("API Response of tests:", response);
        
        if (response.status === 200) {
          // Handle the new response structure
          setTests(response.data || []);
        } else {
          setTestError(response.message || "Failed to fetch tests");
        }
      } catch (error: any) {
        console.error("Error fetching tests:", error);
        setTestError(error.message || "An error occurred while fetching tests");
      } finally {
        setIsLoadingTests(false);
      }
    };

    fetchTests();
  }, [user?.token]);

  // Filter tests based on search query and filters
  const filteredTests = tests.filter(test => {
    const matchesSearch = (test.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || (test.type === filterType);
    const matchesTask = filterTask === "all" || (test.task === filterTask);
    
    return matchesSearch && matchesType && matchesTask;
  });

  // Get unique test types and tasks for filters
  const testTypes = ["all", ...new Set(tests.map(test => test.type || "Unknown"))];
  const testTasks = ["all", ...new Set(tests.map(test => test.task || "Unknown"))];

  const resetFileStates = () => {
    setFileEmails([]);
    setFileError("");
    setFileSuccess("");
    setDuplicates([]);
    setInvalidEmails([]);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateEmails = (emailString: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailList = emailString.split(",").map(email => email.trim());
    
    for (const email of emailList) {
      if (email && !emailRegex.test(email)) {
        setError(`Invalid email format: ${email}`);
        setSuccess("");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleEmailSubmit = async () => {
    if (!emails.trim()) {
      setError("Please enter at least one email address");
      setSuccess("");
      return;
    }

    if (validateEmails(emails)) {
      try {
        const emailList = emails.split(",").map(email => email.trim()).filter(Boolean);
        const payload = {
          emails: emailList,
          tenantId: user?.tenantId
        };

        const data = await api.post("/api/tenant/users/invite", payload, user?.token);
        
        if (data.success) {
          setSuccess(data.message);
          setEmails("");
          setError("");
        } else {
          throw new Error(data.message || "Failed to send invites");
        }
      } catch (error: any) {
        setError(error.message || "Failed to send emails. Please try again later.");
        console.error("Error sending emails:", error);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    resetFileStates();

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        // Check if file has headers or multiple columns
        if (jsonData.length > 0 && jsonData[0].length > 1) {
          setFileError("File should contain only one column without headers");
          setIsProcessing(false);
          return;
        }

        // Extract emails from the first column
        const extractedEmails = jsonData.map((row: string[]) => row[0]?.toString().trim()).filter(Boolean);
        
        // Find duplicates
        const uniqueEmails = new Set<string>();
        const duplicateEmails: string[] = [];
        
        extractedEmails.forEach(email => {
          if (uniqueEmails.has(email)) {
            duplicateEmails.push(email);
          } else {
            uniqueEmails.add(email);
          }
        });
        
        setDuplicates(duplicateEmails);

        // Validate emails (only unique ones)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmails = Array.from(uniqueEmails).filter(email => emailRegex.test(email));
        const invalidEmailsList = extractedEmails.filter(email => !emailRegex.test(email));
        setInvalidEmails(invalidEmailsList);
        setFileEmails(validEmails);

        if (validEmails.length > 0) {
          setFileSuccess(`Successfully extracted ${validEmails.length} valid unique emails`);
        }
      } catch (error) {
        setFileError("Error processing file. Please ensure it's a valid CSV or Excel file.");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleSendEmails = async () => {
    if (!fileEmails.length) {
      setFileError("No valid emails to send");
      return;
    }
    
    setIsSending(true);
    try {
      const payload = {
        emails: fileEmails,
        tenantId: user?.tenantId
      };

      const data = await api.post("/api/tenant/users/invite", payload, user?.token);
      console.log("data", data);

      if (data.success) {
        setFileSuccess(data.message);
        resetFileStates();
      } else {
        throw new Error(data.message || "Failed to send invites");
      }
    } catch (error: any) {
      console.error("Error sending emails:", error);
      setFileError(error.message || "Failed to send emails. Please check your connection and try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Function to handle taking a test
  const handleTakeTest = async (testId: string) => {
    try {
      setIsLoadingTestDetails(true);
      dispatch({ type: 'test/setLoading', payload: true });
      setSelectedTestId(testId);
      
      // Fetch test details from API
      const response = await api.get(`/api/tests/${testId}`, user?.token || "");
      console.log("Test Details Response:", response);
      
      if (response.status === 200) {
        // Process the API response
        let testData = response.data;

        console.log("Test Data:", testData);
        
        // Make sure there's at least one module
        if (!testData.modules || testData.modules.length === 0) {
          // Create a default module structure if none exists
          testData = {
            ...testData,
            modules: [{
              id: "1",
              name: "Reading",
              totalParts: 2,
              allowedTime: 60,
              isCountDown: true,
              timeUnit: "minutes",
              parts: [{
                id: "1",
                name: "Part 1",
                sections: []
              }],
              officialInstructions: [
                "Do not open this question paper until you are told to do so.",
                "Write your name and candidate number in the spaces at the top of this page.",
                "Read the instructions for each part of the paper carefully.",
                "Answer all the questions.",
                "Write your answers on the answer sheet. Use a pencil.",
                "You must complete the answer sheet within the time limit.",
                "At the end of the test, hand in both this question paper and your answer sheet."
              ],
              informationForCandidates: [
                "There are 40 questions.",
                "Each question carries one mark.",
                "YOU MUST FILL IN YOUR ANSWER SHEET!",
                "To view the answer sheet, click VIEW ANSWER SHEET at the bottom of the paper."
              ]
            }]
          };
        }
        
        dispatch({ type: 'test/setCurrentTest', payload: testData });
        navigate(`/test/${testId}`); // Navigate to test page
      } else {
        const errorMsg = response.message || "Failed to load test details";
        dispatch({ type: 'test/setError', payload: errorMsg });
        setTestDetailsError(errorMsg);
      }
    } catch (error: any) {
      console.error("Error loading test details:", error);
      const errorMessage = error.message || "An error occurred while loading test details";
      dispatch({ type: 'test/setError', payload: errorMessage });
      setTestDetailsError(errorMessage);
    } finally {
      setIsLoadingTestDetails(false);
      dispatch({ type: 'test/setLoading', payload: false });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{getTokenExpirationTime()}</span>
          </Badge>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2 hover:text-red-600 hover:border-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold">1,234</h3>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Courses</p>
              <h3 className="text-2xl font-bold">45</h3>
              <p className="text-sm text-green-600">+5 new this month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Conversations</p>
              <h3 className="text-2xl font-bold">8,567</h3>
              <p className="text-sm text-green-600">+23% from last month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold">892</h3>
              <p className="text-sm text-green-600">+8% from last month</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 items-start">
            <Card className="p-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Send Emails</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter email addresses (comma-separated)"
                      value={emails}
                      onChange={(e) => {
                        setEmails(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      className={error ? "border-red-500" : ""}
                    />
                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}
                    {success && (
                      <p className="text-sm text-green-500">{success}</p>
                    )}
                  </div>
                  <Button 
                    onClick={handleEmailSubmit}
                    className="w-full"
                  >
                    Send Emails
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Upload Email List</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer relative
                    ${isProcessing 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-blue-500'}`}
                  >
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      ref={fileInputRef}
                      disabled={isProcessing}
                    />
                    <label 
                      htmlFor="file-upload" 
                      className={`cursor-pointer flex flex-col items-center gap-2 ${isProcessing ? 'cursor-not-allowed' : ''}`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Processing file...
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Please wait while we validate the emails
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Drag and drop your file here, or click to browse
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Supports CSV and Excel files (.csv, .xlsx, .xls)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  {fileError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {fileError}
                      </p>
                    </div>
                  )}

                  {fileSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {fileSuccess}
                      </p>
                    </div>
                  )}

                  {(duplicates.length > 0 || invalidEmails.length > 0 || fileEmails.length > 0) && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-600 flex items-center gap-2 font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          Summary:
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700">Total Emails:</span>
                            <span className="font-medium text-blue-900">{fileEmails.length + duplicates.length + invalidEmails.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">Valid Unique:</span>
                            <span className="font-medium text-green-900">{fileEmails.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-700">Duplicates:</span>
                            <span className="font-medium text-yellow-900">{duplicates.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-red-700">Invalid:</span>
                            <span className="font-medium text-red-900">{invalidEmails.length}</span>
                          </div>
                        </div>
                      </div>

                      {duplicates.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium text-yellow-600">Duplicate Emails Found ({duplicates.length})</p>
                          </div>
                          <div className="max-h-32 overflow-y-auto bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            {duplicates.map((email, index) => (
                              <p key={index} className="text-sm text-yellow-700">{email}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {invalidEmails.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium text-red-600">Invalid Emails Found ({invalidEmails.length})</p>
                          </div>
                          <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded-md p-3">
                            {invalidEmails.map((email, index) => (
                              <p key={index} className="text-sm text-red-700">{email}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {fileEmails.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <p className="text-sm font-medium text-green-600">Valid Unique Emails ({fileEmails.length})</p>
                            </div>
                          </div>
                          <div className="max-h-32 overflow-y-auto bg-green-50 border border-green-200 rounded-md p-3">
                            {fileEmails.map((email, index) => (
                              <p key={index} className="text-sm text-green-700">{email}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {fileEmails.length > 0 && (
                        <div className="pt-4 border-t">
                          <Button 
                            onClick={handleSendEmails}
                            disabled={isSending}
                            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                            size="lg"
                          >
                            {isSending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="h-4 w-4" />
                                Send Emails
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold">IELTS Tests</h2>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Test
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search tests..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border rounded-md"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    {testTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "all" ? "All Types" : type}
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 border rounded-md"
                    value={filterTask}
                    onChange={(e) => setFilterTask(e.target.value)}
                  >
                    {testTasks.map((task) => (
                      <option key={task} value={task}>
                        {task === "all" ? "All Tasks" : task}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tests Grid */}
              {isLoadingTests ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : testError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No tests found</h3>
                  <p className="text-gray-500 max-w-md mb-4">No test found against this admin tenant</p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : filteredTests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map((test) => (
                    <Card key={test.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{test.name}</h3>
                          <Badge 
                            variant={test.status === "PUBLISHED" ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {test.status || "Unknown Status"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">ID</p>
                            <p className="font-medium">{test.id}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Source</p>
                            <p className="font-medium">{test.source || "Unknown"}</p>
                          </div>
                          {test.type && (
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p className="font-medium">{test.type}</p>
                            </div>
                          )}
                          {test.task && (
                            <div>
                              <p className="text-muted-foreground">Task</p>
                              <p className="font-medium">{test.task}</p>
                            </div>
                          )}
                          {test.questions && (
                            <div>
                              <p className="text-muted-foreground">Questions</p>
                              <p className="font-medium">{test.questions}</p>
                            </div>
                          )}
                          {test.duration && (
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">{test.duration}</p>
                            </div>
                          )}
                          {test.difficulty && (
                            <div>
                              <p className="text-muted-foreground">Difficulty</p>
                              <p className="font-medium">{test.difficulty}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleTakeTest(test.id)}
                            disabled={isLoadingTestDetails && selectedTestId === test.id}
                          >
                            {isLoadingTestDetails && selectedTestId === test.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Take Test
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No tests found</h3>
                  <p className="text-gray-500 max-w-md">
                    {searchQuery || filterType !== "all" || filterTask !== "all"
                      ? "No tests match your current filters. Try adjusting your search criteria."
                      : "No test found against this admin tenant. Click the 'Create New Test' button to get started."}
                  </p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Test
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 