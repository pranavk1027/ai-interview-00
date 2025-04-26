"use client"
import { db } from '@/utils/db'
import { UserAnswer, MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

function Feedback() {
  const params = useParams();
  const [feedbackList, setFeedbackList] = useState([]);
  const [overallRating, setOverallRating] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    if (params?.interviewId) {
      getFeedback();
    }
  }, [params?.interviewId]);

  const getFeedback = async () => {
    try {
      // First, get all questions from the interview
      const interviewResult = await db.select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, String(params.interviewId)));

      if (!interviewResult || interviewResult.length === 0) {
        console.error('No interview found');
        return;
      }

      const questions = JSON.parse(interviewResult[0].jsonMockResp);
      
      // Then, get all answered questions
      const answeredResult = await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, String(params.interviewId)));

      // Create a map of answered questions
      const answeredMap = new Map(
        answeredResult.map(answer => [answer.question, answer])
      );

      // Combine all questions with answers (or mark as unanswered)
      const combinedFeedback = questions.map((question, index) => ({
        question: question.question,
        correctAns: question.answer,
        userAns: answeredMap.has(question.question) ? answeredMap.get(question.question).userAns : "Not Answered",
        feedback: answeredMap.has(question.question) ? answeredMap.get(question.question).feedback : "No feedback available",
        rating: answeredMap.has(question.question) ? answeredMap.get(question.question).rating : "N/A",
        difficulty: question.difficulty
      }));

      setFeedbackList(combinedFeedback);

      // Calculate overall rating only from answered questions
      const answeredQuestions = answeredResult.filter(item => item.rating);
      if (answeredQuestions.length > 0) {
        const totalRating = answeredQuestions.reduce((sum, item) => {
          const rating = parseFloat(item.rating) || 0;
          return sum + rating;
        }, 0);
        const avgRating = (totalRating / 15).toFixed(1);
        setOverallRating(avgRating);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const getRatingColor = (rating) => {
    if (rating === "N/A") return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    const numRating = parseFloat(rating);
    if (numRating >= 8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (numRating >= 6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'basic': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className='p-6 md:p-10 max-w-4xl mx-auto'>
      <div className='space-y-4 mb-8'>
        <h2 className='text-3xl font-bold text-green-500 dark:text-green-400'>Congratulations!</h2>
        <h2 className='font-bold text-2xl dark:text-white'>Here is your interview feedback</h2>
        <div className='flex items-center gap-2'>
          <h2 className='text-primary text-lg'>Overall Interview Rating:</h2>
          <span className={`px-3 py-1 rounded-full text-lg font-medium ${getRatingColor(overallRating || "N/A")}`}>
            {overallRating ? `${overallRating}/10` : "N/A"}
          </span>
        </div>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Find below your answers, correct answers, and feedback for each question
        </p>
      </div>

      <div className='space-y-4 overflow-auto max-h-[600px] p-4 border rounded-lg'>
        {feedbackList.map((item, index) => (
          <div key={index} className='border rounded-lg overflow-hidden'>
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className='flex items-center justify-between w-full p-4 text-left bg-secondary hover:bg-secondary/80 dark:hover:bg-secondary/30'
            >
              <div className='flex items-center gap-3'>
                <span className='text-sm font-medium'>Question {index + 1}</span>
                <span className={`px-2 py-1 rounded-full text-sm ${getRatingColor(item.rating)}`}>
                  {item.rating === "N/A" ? "Not Answered" : `${item.rating}/10`}
                </span>
                <span className={`text-sm font-medium ${getDifficultyColor(item.difficulty)}`}>
                  {item.difficulty}
                </span>
              </div>
              <span className='text-sm text-gray-500'>{expandedIndex === index ? 'Click to collapse' : 'Click to expand'}</span>
            </button>
            
            {expandedIndex === index && (
              <div className='p-4 space-y-4 bg-white dark:bg-gray-800'>
                <div>
                  <h3 className='font-medium mb-2'>Question:</h3>
                  <p className='text-gray-600 dark:text-gray-300'>{item.question}</p>
                </div>

                <hr className='border-gray-200 dark:border-gray-700' />

                <div>
                  <h3 className='font-medium mb-2'>Your Answer:</h3>
                  <p className='text-gray-600 dark:text-gray-300'>{item.userAns}</p>
                </div>

                <hr className='border-gray-200 dark:border-gray-700' />

                <div>
                  <h3 className='font-medium mb-2'>Correct Answer:</h3>
                  <p className='text-gray-600 dark:text-gray-300'>{item.correctAns}</p>
                </div>

                {item.rating !== "N/A" && (
                  <>
                    <hr className='border-gray-200 dark:border-gray-700' />
                    <div>
                      <h3 className='font-medium mb-2'>Feedback:</h3>
                      <div className='bg-gray-50 dark:bg-gray-900 p-3 rounded-lg'>
                        <p className='text-gray-600 dark:text-gray-300'>{item.feedback}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feedback;