import { Subtitle } from '@/types/subtitle';

export interface Section {
  title: string;
  startTime: number;
  endTime: number;
  subtitles: Subtitle[];
}

export interface ParsedSubtitles {
  sections: Section[];
  subtitles: Subtitle[];
}

// Helper function to convert timestamp to seconds
function timeToSeconds(timestamp: string): number {
  const [minutes, seconds] = timestamp.split(':').map(Number);
  return minutes * 60 + seconds;
}

// Helper function to convert seconds to timestamp
function secondsToTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function parseSubtitleFile(content: string): ParsedSubtitles {
  const lines = content.trim().split('\n');
  const sections: Section[] = [];
  const subtitles: Subtitle[] = [];
  let currentSection: Section | undefined;

  let currentTime = 0;
  const timePerSubtitle = 5; // Each subtitle takes 5 seconds by default

  lines.forEach((line) => {
    line = line.trim();
    if (!line) return;

    // Check if line starts with [Section]
    if (line.startsWith('[Section')) {
      if (currentSection) {
        currentSection.endTime = currentTime;
        sections.push(currentSection);
      }

      currentSection = {
        title: line.replace(/[\[\]]/g, '').trim(),
        startTime: currentTime,
        endTime: 0,
        subtitles: []
      };
    } else {
      // Regular subtitle line
      const subtitle: Subtitle = {
        startTime: currentTime,
        endTime: currentTime + timePerSubtitle,
        text: line
      };

      subtitles.push(subtitle);
      if (currentSection) {
        currentSection.subtitles.push(subtitle);
      }

      currentTime += timePerSubtitle;
    }
  });

  // Add the last section if exists
  if (currentSection) {
    currentSection.endTime = currentTime;
    sections.push(currentSection);
  }

  return { sections, subtitles };
}

// Example usage with a test subtitle file
export const testSubtitles = `[Section 1: Introduction]
Welcome to the IELTS Listening test.
You will hear a number of different recordings.
Each recording will play only once.
The test is divided into 4 sections.
At the end of the test, you will be given ten minutes to transfer your answers.

[Section 2: Conversation]
Travel Agent: Good morning. Welcome to Sunshine Travel. How can I help you?
Customer: Hi, I'd like to book a holiday package to New Zealand.
Travel Agent: Certainly. When were you thinking of traveling?
Customer: I was looking at dates in July, probably around the middle of the month.
Travel Agent: Okay, and how long would you like to stay?

[Section 3: Discussion]
Customer: We're thinking of a two-week trip. Is that enough time to see both islands?
Travel Agent: Two weeks is a good amount of time for both islands.
Customer: Great. And what's the weather like in July?
Travel Agent: July is winter in New Zealand. Temperatures between 10 to 15 degrees Celsius.
Customer: That's not too cold. What about accommodation options?`;

// Parse test subtitles
export const parsedTestSubtitles = parseSubtitleFile(testSubtitles); 