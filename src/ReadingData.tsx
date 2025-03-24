export const testData = {
  testID: 1,
  module: {
    ID: 1,
    name: "Reading",
    totalQuestions: 40,
    totalParts: 3,
    allowedTime: 60,
    isCountDown: true,
    timeUnit: "minutes", 
    instructions: "Read the passage and answer the questions that follow.",
    moduleOrder: 1,
    partDetails: [
      {
        ID: 1,
        name: "Part 1",
        totalQuestions: 13,
        instructions: "Read the passage and answer the questions that follow.",
        partOrder: 1,
        contentType: "Audio | Text",
        content: {
          audioURL: "http://www.example.com/audio.mp3",
          text: <p>A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality</p>,
        },
        question_groups: [
          {
            instructions:
              "Choose the correct answer from the options given below.",
            title: "Questions 1-2",
            noOfQuestions: 7,
            startFrom: 2,
            type: "selection ",
            subtype: "Radio",
            questions: [
              {
                questionNo: 1,
                questionId: "UUID",
                statement: "What is the main idea of the passage?",
                options: [
                  {
                    ID: 1,
                    content: "The passage is about the importance of reading.",
                  },
                  {
                    ID: 2,
                    content: "The passage is about the importance of writing.",
                  },
                  {
                    ID: 3,
                    content:
                      "The passage is about the importance of listening.",
                  },
                  {
                    ID: 4,
                    content: "The passage is about the importance of speaking.",
                  },
                ],
              },
              {
                questionNo: 2,
                questionId: "UUID",
                statement: "Caterpillars are eaten by a number of different predators.",
                options: [
                  {
                    ID: 1,
                    content: "TRUE",
                  },
                  {
                    ID: 2,
                    content: "FALSE",
                  },
                  {
                    ID: 3,
                    content:
                      "NOT GIVEN",
                  },
                ],
              },
              {
                questionNo: 3,
                questionId: "UUID",
                statement: "Phenology is a term used to describe a creature’s ability to alter the location of a lifecycle event",
                options: [
                  {
                    ID: 1,
                    content: "TRUE",
                  },
                  {
                    ID: 2,
                    content: "FALSE",
                  },
                  {
                    ID: 3,
                    content:
                      "NOT GIVEN",
                  },
                ],
              },
              
            ],
          },
          {
            instructions:
              "Choose the correct answer from the options given below.",
            title: "Questions 8-13",
            noOfQuestions: 7,
            startFrom: 2,
            type: "selection ",
            subtype: "Checkbox",
            questions: [
              {
                questionNo: 1,
                statement: "What is the main idea of the passage?",
                options: [
                  {
                    ID: 1,
                    content: "The passage is about the importance of reading.",
                  },
                  {
                    ID: 2,
                    content: "The passage is about the importance of writing.",
                  },
                  {
                    ID: 3,
                    content:
                      "The passage is about the importance of listening.",
                  },
                  {
                    ID: 4,
                    content: "The passage is about the importance of speaking.",
                  },
                ],
              },
              {
                questionNo: 2,
                statement: "What is the main idea of the passage?",
                options: [
                  {
                    ID: 1,
                    content: "The passage is about the importance of reading.",
                  },
                  {
                    ID: 2,
                    content: "The passage is about the importance of writing.",
                  },
                  {
                    ID: 3,
                    content:
                      "The passage is about the importance of listening.",
                  },
                  {
                    ID: 4,
                    content: "The passage is about the importance of speaking.",
                  },
                ],
              },
              {
                questionNo: 3,
                statement: "What is the main idea of the passage?",
                options: [
                  {
                    ID: 1,
                    content: "The passage is about the importance of reading.",
                  },
                  {
                    ID: 2,
                    content: "The passage is about the importance of writing.",
                  },
                  {
                    ID: 3,
                    content:
                      "The passage is about the importance of listening.",
                  },
                  {
                    ID: 4,
                    content: "The passage is about the importance of speaking.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        ID: 2,
        name: "Part 2",
        totalQuestions: 9,
        instructions: "Read the passage and answer the questions that follow.",
        partOrder: 2,
        contentType: "Audio | Text",
        content: {
          audioURL: "http://www.example.com/audio.mp3",
          text: <p>A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality</p>,
        },
        question_groups: [
          {
            instructions:
              "Write one word in the missing field",
            title: "Questions 1-5",
            noOfQuestions: 5,
            startFrom: 1,
            type: "writing",
            subtype: "fillInTheBlanks",
            questions: [
              {
                questionNo: 1,
                questionId: "UUID",
                statement: "What is the main idea of the passage {{}}",
              },{
                questionNo: 2,
                questionId: "UUID",
                statement: "What is {{}} the main idea of the passage",
              },{
                questionNo: 3,
                questionId: "UUID",
                statement: "What is the main {{}} idea of the passage",
              },{
                questionNo: 4,
                questionId: "UUID",
                statement: "What is the main idea {{}} of the passage",
              },{
                questionNo: 5,
                questionId: "UUID",
                statement: "What is the main idea of {{}} the passage",
              }
            ],
          },{
            instructions:
              "Write one word in the missing field",
            title: "Questions 6-10",
            noOfQuestions: 5,
            startFrom: 6,
            type: "writing",
            subtype: "fillInTheBlanksGrouped",
            questions: [
              {
                questionNo: "6-7-8-9",
                statement: "What is the {{UUID}} main idea {{UUId}} of the passage {{UUID}} ertfehg {{UUID}}",
              },{
                questionNo: "10-11",
                statement: "What is {{UUID}} the main idea of the passage {{UUID}}",
              }
            ],
          }
        ],
      },
      {
        ID: 3,
        name: "Part 3",
        totalQuestions: 20,
        instructions: "Read the passage and answer the questions that follow.",
        partOrder: 1,
        contentType: "Audio | Text",
        content: {
          audioURL: "http://www.example.com/audio.mp3",
          text: <p>A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality.A psychologist gives his view on how humans became self-centred.There has long been a general assumption that human beings are essentially selfish. We’re apparently ruthless, with strong impulses to compete against each other for resources and to accumulate power and possessions. If we are kind to one another, it’s usually because we have ulterior motives. If we are good, it’s only because we have managed to control and transcend our innate selfishness and brutality</p>
        },
        question_groups: [
          {
            instructions:
              "Choose the correct answer from the options given below.",
            title: "Questions 1-7",
            noOfQuestions: 7,
            startFrom: 2,
            type: "selection",
            subtype: " DragDrop",
            questions: [
              {
                questionNo: 1,
                statement: "What is the main idea of the passage?",
                options: [
                  {
                    ID: 1,
                    content: "The passage is about the importance of reading.",
                  },
                  {
                    ID: 2,
                    content: "The passage is about the importance of writing.",
                  },
                  {
                    ID: 3,
                    content:
                      "The passage is about the importance of listening.",
                  },
                  {
                    ID: 4,
                    content: "The passage is about the importance of speaking.",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
