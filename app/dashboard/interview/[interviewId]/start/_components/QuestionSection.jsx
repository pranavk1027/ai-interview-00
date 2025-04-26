import { Lightbulb, Volume2, ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'

function QuestionSection({mockInterviewQuestion,activequestionindex,setactivequestion}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const textToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
  
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            speech.voice = voices[0];
          }
          window.speechSynthesis.speak(speech);
        };
      } else {
        speech.voice = voices[0];
        window.speechSynthesis.speak(speech);
      }
    } else {
      alert('Sorry, your browser does not support text-to-speech');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'basic': return 'bg-green-100 hover:bg-green-200';
      case 'medium': return 'bg-yellow-100 hover:bg-yellow-200';
      case 'advanced': return 'bg-red-100 hover:bg-red-200';
      default: return 'bg-secondary';
    }
  };

  const groupQuestionsByDifficulty = () => {
    if (!mockInterviewQuestion) return {};
    return mockInterviewQuestion.reduce((acc, question, index) => {
      const difficulty = question.difficulty?.toLowerCase() || 'basic';
      if (!acc[difficulty]) acc[difficulty] = [];
      acc[difficulty].push({...question, index});
      return acc;
    }, {});
  };

  const groupedQuestions = groupQuestionsByDifficulty();
  
  return mockInterviewQuestion && (
    <div className='p-5 border rounded dark:border-gray-700'>
      {/* Collapsible Header */}
      <div 
        className='flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg mb-4'
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className='font-semibold text-lg'>Interview Questions</h3>
        {isCollapsed ? 
          <ChevronDown className='h-5 w-5 text-gray-500' /> : 
          <ChevronUp className='h-5 w-5 text-gray-500' />
        }
      </div>

      {/* Questions Grid */}
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'hidden' : 'block'}`}>
        {['basic', 'medium', 'advanced'].map((difficulty) => (
          <div key={difficulty} className='mb-6'>
            <h3 className='text-sm font-medium capitalize mb-3 text-gray-600 dark:text-gray-400'>{difficulty} Level Questions</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
              {groupedQuestions[difficulty]?.map((question) => (
                <h2 
                  key={question.index} 
                  onClick={() => setactivequestion(question.index)}
                  className={`p-2 rounded-full text-xs md:text-sm text-center cursor-pointer 
                    ${getDifficultyColor(difficulty)}
                    ${activequestionindex === question.index ? '!bg-blue-700 text-white dark:text-white' : 'dark:text-gray-300'}`}
                >
                  Q{question.index + 1}
                </h2>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Current Question Display */}
      <div className='mt-8 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700'>
        <div className='flex items-center gap-2 mb-2'>
          <h3 className='text-lg font-semibold'>
            Question {activequestionindex + 1} 
            <span className='ml-2 text-sm font-normal capitalize text-gray-600 dark:text-gray-400'>
              ({mockInterviewQuestion[activequestionindex]?.difficulty || 'Basic'} Level)
            </span>
          </h3>
          <Volume2 
            className='cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' 
            onClick={() => textToSpeech(mockInterviewQuestion[activequestionindex]?.question)}
          />
        </div>
        <p className='text-md md:text-lg dark:text-gray-200'>
          {mockInterviewQuestion[activequestionindex]?.question}
        </p>
      </div>
   
      <div className='border rounded-lg p-5 bg-blue-100 dark:bg-blue-900 mt-8 dark:border-blue-800'>
        <h2 className='flex gap-2 items-center text-blue-700 dark:text-blue-300'>
          <Lightbulb/>
          <strong>Note:</strong>
        </h2>
        <h2 className='text-sm text-primary dark:text-gray-300 my-2'>
          Click on Record Answer when you want to answer the question. At the end of interview we will give you the feedback along with correct answer for each of question and your answer to compare it.
        </h2>
      </div>
    </div>
  )
}

export default QuestionSection