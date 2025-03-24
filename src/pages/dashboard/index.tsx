import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Dashboard() {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");
  const [selectedTaskFilter, setSelectedTaskFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const testData = {
    academicReading: [
      {
        id: 1,
        title: "Cambridge IELTS 19 Academic Reading Test 4",
        task: "Task 2",
        type: "Academic",
      },
      {
        id: 2,
        title: "Cambridge IELTS 19 Academic Reading Test 3",
        task: "Task 1",
        type: "Academic",
      },
    ],
    academicWriting: [
      {
        id: 3,
        title: "Cambridge IELTS 19 Academic Writing Test 4",
        task: "Task 2",
        type: "Academic",
      },
      {
        id: 4,
        title: "Cambridge IELTS 19 Academic Writing Test 3",
        task: "Task 1",
        type: "Academic",
      },
    ],
    academicListening: [
      {
        id: 5,
        title: "Cambridge IELTS 19 Academic Listening Test 4",
        task: "Full Test",
        type: "Academic",
      },
      {
        id: 6,
        title: "Cambridge IELTS 19 Academic Listening Test 3",
        task: "Full Test",
        type: "Academic",
      },
    ],
    academicSpeaking: [
      {
        id: 7,
        title: "Cambridge IELTS 19 Academic Speaking Test 4",
        task: "Full Test",
        type: "Academic",
      },
      {
        id: 8,
        title: "Cambridge IELTS 19 Academic Speaking Test 3",
        task: "Full Test",
        type: "Academic",
      },
    ],
    academicFullTest: [
      {
        id: 11,
        title: "Cambridge IELTS 19 Academic Full Test 4",
        task: "Complete Test",
        type: "Academic",
      },
      {
        id: 12,
        title: "Cambridge IELTS 19 Academic Full Test 3",
        task: "Complete Test",
        type: "Academic",
      },
    ],
    generalReading: [
      {
        id: 13,
        title: "Cambridge IELTS 19 General Reading Test 4",
        task: "Task 1",
        type: "General",
      },
      {
        id: 14,
        title: "Cambridge IELTS 19 General Reading Test 3",
        task: "Task 2",
        type: "General",
      },
    ],
    generalWriting: [
      {
        id: 15,
        title: "Cambridge IELTS 19 General Writing Test 4",
        task: "Task 1",
        type: "General",
      },
      {
        id: 16,
        title: "Cambridge IELTS 19 General Writing Test 3",
        task: "Task 2",
        type: "General",
      },
    ],
    generalListening: [
      {
        id: 17,
        title: "Cambridge IELTS 19 General Listening Test 4",
        task: "Full Test",
        type: "General",
      },
      {
        id: 18,
        title: "Cambridge IELTS 19 General Listening Test 3",
        task: "Full Test",
        type: "General",
      },
    ],
    generalSpeaking: [
      {
        id: 19,
        title: "Cambridge IELTS 19 General Speaking Test 4",
        task: "Full Test",
        type: "General",
      },
      {
        id: 20,
        title: "Cambridge IELTS 19 General Speaking Test 3",
        task: "Full Test",
        type: "General",
      },
    ],
    generalFullTest: [
      {
        id: 21,
        title: "Cambridge IELTS 19 General Full Test 4",
        task: "Complete Test",
        type: "General",
      },
      {
        id: 22,
        title: "Cambridge IELTS 19 General Full Test 3",
        task: "Complete Test",
        type: "General",
      },
    ],
  };

  // Get tests based on selected filters and category
  const getFilteredTests = (category: string) => {
    // Start with all tests for the selected category
    let filteredTests = [] as any[];
    
    // Filter by type (Academic/General)
    if (selectedTypeFilter === "All") {
      // Combine both Academic and General tests for the category
      filteredTests = [
        ...testData[`academic${category}` as keyof typeof testData] || [],
        ...testData[`general${category}` as keyof typeof testData] || [],
      ];
    } else {
      const prefix = selectedTypeFilter.toLowerCase();
      const key = `${prefix}${category}` as keyof typeof testData;
      filteredTests = testData[key] || [];
    }
    
    // Filter by task type if a specific task is selected
    if (selectedTaskFilter !== "All") {
      filteredTests = filteredTests.filter(test => test.task === selectedTaskFilter);
    }
    
    // Filter by search query if present
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filteredTests = filteredTests.filter(test => 
        test.title.toLowerCase().includes(query) ||
        test.task.toLowerCase().includes(query)
      );
    }
    
    return filteredTests;
  };

  // Get all available task types from test data
  const getAvailableTaskTypes = () => {
    const taskTypes = new Set<string>();
    
    Object.values(testData).forEach(tests => {
      tests.forEach((test: any) => {
        taskTypes.add(test.task);
      });
    });
    
    return ["All", ...Array.from(taskTypes)];
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-navy-900">
          Master IELTS Now: 1000+ Tests
        </h1>
        <p className="mb-12 text-lg text-gray-600">
          Start Practicing Today! Access Our Complete Collection of IELTS Tests & Samples - Find Your Category and Begin!
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Filters Section */}
          <Card className="p-6">
            <CardHeader className="px-0">
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-6">
                <div>
                  <Label>Search</Label>
                  <Input
                    type="search"
                    placeholder="Search tests..."
                    className="mt-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Test Type</Label>
                  <Select 
                    value={selectedTypeFilter} 
                    onValueChange={setSelectedTypeFilter}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Task Type</Label>
                  <Select 
                    value={selectedTaskFilter} 
                    onValueChange={setSelectedTaskFilter}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTaskTypes().map((task) => (
                        <SelectItem key={task} value={task}>
                          {task}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    setSelectedTypeFilter("All");
                    setSelectedTaskFilter("All");
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tests Grid */}
          <div className="md:col-span-3">
            <div className="mb-6 flex gap-2">
              <Button
                variant={selectedTypeFilter === "All" ? "default" : "outline"}
                onClick={() => setSelectedTypeFilter("All")}
              >
                All
              </Button>
              <Button
                variant={selectedTypeFilter === "Academic" ? "default" : "outline"}
                onClick={() => setSelectedTypeFilter("Academic")}
              >
                Academic
              </Button>
              <Button
                variant={selectedTypeFilter === "General" ? "default" : "outline"}
                onClick={() => setSelectedTypeFilter("General")}
              >
                General Training
              </Button>
            </div>

            <Tabs defaultValue="Reading" className="w-full">
              <TabsList className="mb-6 w-full justify-start">
                <TabsTrigger value="Reading">Reading</TabsTrigger>
                <TabsTrigger value="Writing">Writing</TabsTrigger>
                <TabsTrigger value="Listening">Listening</TabsTrigger>
                <TabsTrigger value="Speaking">Speaking</TabsTrigger>
                <TabsTrigger value="FullTest">Full Test</TabsTrigger>
              </TabsList>

              {["Reading", "Writing", "Listening", "Speaking", "FullTest"].map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid gap-6 md:grid-cols-3">
                    {getFilteredTests(category).map((test) => (
                      <Card key={test.id} className="overflow-hidden">
                        <CardHeader className="space-y-1 p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">{test.task}</div>
                            <div className="text-xs font-medium">
                              {test.type === "Academic" ? (
                                <span className="text-blue-600">Academic</span>
                              ) : (
                                <span className="text-green-600">General</span>
                              )}
                            </div>
                          </div>
                          <CardTitle className="text-lg">{test.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Button className="w-full" variant="default">
                            Take Test
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}