import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// API Response structure
export interface ApiResponse {
  status: number;
  message: string;
  path: string;
  timestamp: string;
  data: TestData;
}

// Test data structure
export interface TestData {
  id: string;
  tenantId: string;
  status: string;
  source: string;
  name: string;
  module: TestModule[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Question structure for various question types
export interface Question {
  id: number;
  questionId: string;
  statement?: string;
  inputType?: string;
  content?: string;
  options?: Option[];
}

// Option structure for multiple choice questions
export interface Option {
  id: number;
  letter: string;
  content: string;
}

// List item structure for matching questions
export interface ListItem {
  id: number;
  letter?: string;
  number?: string;
  text: string;
}

// Section content structure
export interface SectionContent {
  type: string;
  content?: string;
  id?: number;
  questionId?: string;
  inputType?: string;
}

// Sentence structure for sentence completion questions
export interface Sentence {
  sentence: Array<{
    type: string;
    content?: string;
    id?: number;
    questionId?: string;
    inputType?: string;
  }>;
}

// Question group structure
export interface QuestionGroup {
  id: string;
  name: string;
  instructions: string;
  noOfQuestions: number;
  startFrom: number;
  type: string;
  questionsRange: string;
  answerType?: string;
  heading?: string;
  hasImage?: boolean;
  content?: SectionContent[];
  questions?: Question[];
  sentences?: Sentence[];
  matchingQuestions?: Question[];
  list?: ListItem[];
  listHeading?: string;
  imageUrl?: string;
}

// Test part structure
export interface TestPart {
  id: string;
  name: string;
  sections: QuestionSection[];
}

// Question section structure
export interface QuestionSection {
  id: string;
  name: string;
  instructions: string;
  noOfQuestions: number;
  startFrom: number;
  type: string;
  questionsRange: string;
  answerType: string;
  heading?: string;
  content: SectionContent[];
  questions?: Question[];
}

// Part details structure
export interface PartDetails {
  id: number;
  partHeading: string;
  passageHeading?: string;
  passage?: string;
  totalQuestions?: number;
  instructions: string;
  partOrder: number;
  contentType?: string;
  audioURL?: string;
  content?: {
    audioURL?: string;
    text?: string;
  };
  imageUrl?: string;
  question_groups?: QuestionGroup[];
}

export interface TestDetails {
  id: string;
  name: string;
  source: string;
  status: string;
}

// Test module structure
export interface TestModule {
  id: string;
  name: string;
  source: string;
  totalParts: number;
  allowedTime?: number;
  totalQuestions?: number;
  isCountDown?: boolean;
  timeUnit?: string;
  isModule?: boolean;
  modules: TestDetails[];
  parts?: TestPart[];
  instructions: string;
  moduleOrder: number;
  partDetails: PartDetails[];
  officialInstructions?: string[];
  informationForCandidates?: string[];
}

// Main test state interface
export interface TestState {
  currentTest: TestModule | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TestState = {
  currentTest: null,
  isLoading: false,
  error: null,
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setCurrentTest: (state, action: PayloadAction<TestModule>) => {
      console.log("action.payload",action.payload)
      state.currentTest = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearCurrentTest: (state) => {
      state.currentTest = null;
      state.error = null;
    },
  },
});

export const { setCurrentTest, setLoading, setError, clearCurrentTest } = testSlice.actions;
export default testSlice.reducer; 