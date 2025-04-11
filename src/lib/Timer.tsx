import React from 'react'
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormatTime from "./FormatTime";



interface TimerProps {
    readingModule:{
        name: string;
        totalQuestions?:number;
        totalParts?:number;
    };
    timer:number;
    handleExitTest:()=>void;
    timeRemainingPercentage:number;
}


function Timer({ readingModule, timer, handleExitTest, timeRemainingPercentage }: TimerProps) {
  return (
    <React.Fragment>
    <div className="bg-blue-900 text-white p-2 sticky top-0 z-10">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2 w-1/4">
        <span className="font-bold">{readingModule.name}</span>
      </div>
      
      <div className="flex justify-center w-1/2">
        <div className="flex items-center gap-2 bg-blue-800 px-4 py-2 rounded-lg">
          <Clock className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-bold text-lg"><FormatTime timeInSeconds={timer} /></span>
          <span className="text-xs">Time remaining</span>
        </div>
      </div>
      
      <div className="w-1/4 flex justify-end items-center gap-4">
        <span className="text-sm">
          {readingModule.totalQuestions || 0} Questions | {readingModule.totalParts || 0} Parts
        </span>
        <Button 
          variant="outline" 
          onClick={handleExitTest}
          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 border-red-500/20 transition-colors duration-200 text-sm font-medium px-4 py-2 rounded-md"
        >
          Exit Test
        </Button>
      </div>
    </div>
    <Progress value={timeRemainingPercentage} className="h-1 bg-gray-700" indicatorClassName="bg-yellow-400" />
  </div>
  </React.Fragment>
  )
}

export default Timer