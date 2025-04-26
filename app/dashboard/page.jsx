'use client'
import { UserButton } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import AddInterview from './_components/AddInterview'
import { db } from '@/utils/db'
import { MockInterview, UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import moment from 'moment'

function Dashboard() {
  const { user } = useUser();
  const [pastInterviews, setPastInterviews] = useState([]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchPastInterviews();
    }
  }, [user]);

  const fetchPastInterviews = async () => {
    try {
      // Get all interviews for the current user
      const interviews = await db.select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, user.primaryEmailAddress.emailAddress));

      // For each interview, get the average rating
      const interviewsWithRatings = await Promise.all(
        interviews.map(async (interview) => {
          const answers = await db.select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, interview.mockId));

          let avgRating = 'N/A';
          if (answers.length > 0) {
            const totalRating = answers.reduce((sum, answer) => {
              const rating = parseFloat(answer.rating) || 0;
              return sum + rating;
            }, 0);
            avgRating = (totalRating / answers.length).toFixed(1);
          }

          // Convert date string to moment object for sorting
          const momentDate = moment(interview.createdAt, 'DD-MM-YYYY');
          
          return {
            ...interview,
            avgRating,
            momentDate
          };
        })
      );

      // Sort interviews by date (most recent first)
      const sortedInterviews = interviewsWithRatings.sort((a, b) => {
        return b.momentDate.valueOf() - a.momentDate.valueOf();
      });

      setPastInterviews(sortedInterviews);
    } catch (error) {
      console.error('Error fetching past interviews:', error);
    }
  };

  const getRatingColor = (rating) => {
    if (rating === 'N/A') return 'text-gray-500';
    const numRating = parseFloat(rating);
    if (numRating >= 8) return 'text-green-600';
    if (numRating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateStr) => {
    const momentDate = moment(dateStr, 'DD-MM-YYYY');
    const now = moment();
    const diffDays = now.diff(momentDate, 'days');
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return momentDate.format('MMMM D');
    return momentDate.format('MMMM D, YYYY');
  };

  return (
    <div className='p-6 md:p-10'>
      <h2 className='font-bold text-2xl'>Dashboard</h2>
      <h2 className='text-gray-500'>Create and Start your AI Mockup Interview</h2>
      
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 my-5'>
        <AddInterview />
      </div>

      {/* Past Interviews Section */}
      <div className='mt-12'>
        <h2 className='font-bold text-xl mb-6'>Past Interviews</h2>
        <div className='grid grid-cols-1 gap-4'>
          {pastInterviews.map((interview) => (
            <div 
              key={interview.mockId} 
              className='border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start'>
                <div className='space-y-2'>
                  <h3 className='font-semibold text-lg'>{interview.jobPosition}</h3>
                  <p className='text-gray-600 dark:text-gray-300'>
                    <span className='font-medium'>Tech Stack:</span> {interview.jobDesc}
                  </p>
                  <p className='text-gray-600 dark:text-gray-300'>
                    <span className='font-medium'>Experience Required:</span> {interview.jobExperience} years
                  </p>
                  <p className='text-gray-600 dark:text-gray-300'>
                    <span className='font-medium'>Date:</span> {formatDate(interview.createdAt)}
                  </p>
                </div>
                <div className='flex flex-col items-end gap-3'>
                  <div className={`font-bold text-xl ${getRatingColor(interview.avgRating)}`}>
                    {interview.avgRating === 'N/A' ? 'Not Attempted' : `${interview.avgRating}/10`}
                  </div>
                  <Link href={`/dashboard/interview/${interview.mockId}/feedback`}>
                    <Button variant="outline" className="flex gap-2 items-center">
                      <Eye size={16} />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {pastInterviews.length === 0 && (
            <div className='text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              No past interviews found. Start a new interview to see it here!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;