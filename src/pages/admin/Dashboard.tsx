import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, MessageSquare, Activity, Mail, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import * as XLSX from 'xlsx';

const TENANT_ID = "01ARZ3NDEKTSV4RRFFQ69G5FAV";
const API_URL = "http://localhost:8080/api/users/invited-users";

const AdminDashboard = () => {
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
      const emailList = emails.split(",").map(email => email.trim()).filter(Boolean);
      const payload = {
        emails: emailList,
        tenantId: TENANT_ID
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(JSON.stringify(payload));
        setSuccess("Emails sent successfully!");
        setEmails("");
        setError("");
      } catch (error) {
        console.error("Error sending emails:", error);
        setError("Failed to send emails. Please try again.");
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
    if (!fileEmails.length) return;
    
    setIsSending(true);
    try {
      const payload = {
        emails: fileEmails,
        tenantId: TENANT_ID
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(JSON.stringify(payload));
      setFileSuccess(`Successfully sent emails to ${fileEmails.length} recipients`);
      resetFileStates();
    } catch (error) {
      console.error("Error sending emails:", error);
      setFileError("Failed to send emails. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin</p>
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
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 