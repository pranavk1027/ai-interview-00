'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle, Send, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAimodal'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'

function RecordAnswerSection({interviewData,mockInterviewQuestion,activequestionindex}) {
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
      } = useSpeechToText ({
        continuous: true,
        useLegacyResults: false
      });

    const [userAnswer, setAnswer] = useState("");
    const [loading, setloading] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const {user} = useUser();

    useEffect(() => {
        if (isRecording) {
            // Update live transcription
            const currentTranscript = results.map(result => result.transcript).join(' ');
            setAnswer(currentTranscript);
        }
    }, [results, isRecording]);

    const StartStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
            setShowControls(true);
        } else {
            // Clear previous results when starting new recording
            setResults([]);
            setAnswer("");
            setShowControls(false);
            startSpeechToText();
        }
    }

    const handleNewResponse = () => {
        setResults([]);
        setAnswer("");
        setShowControls(false);
        startSpeechToText();
    }

    const UpdateUserAnswer = async () => {
        if (!userAnswer || userAnswer.trim().length < 10) {
            toast.error('Please provide a longer answer before submitting');
            return;
        }

        if (!interviewData?.mockId) {
            toast.error('Interview session not found');
            return;
        }

        setloading(true);
        try {
            const feedbackPrompt = `Question: ${mockInterviewQuestion[activequestionindex]?.question}
User Answer: ${userAnswer}

Please evaluate the answer and provide:
1. A rating out of 10 (as a number between 0 and 10)
2. Detailed feedback on the answer (3-5 lines)

Format your response as a JSON object with exactly these fields:
{
  "rating": "number between 0-10",
  "feedback": "your feedback here"
}`;

            const result = await chatSession.sendMessage(feedbackPrompt);
            const response = await result.response.text();
            let JsonFeedbackResp;
            
            try {
                // Clean up the response to ensure valid JSON
                const jsonStr = response.replace(/```json|```/g, '').trim();
                JsonFeedbackResp = JSON.parse(jsonStr);
                
                // Ensure rating is a number between 0 and 10
                const rating = parseFloat(JsonFeedbackResp.rating);
                if (isNaN(rating) || rating < 0 || rating > 10) {
                    throw new Error('Invalid rating');
                }
                JsonFeedbackResp.rating = rating.toFixed(1); // Format to one decimal place
            } catch (error) {
                console.error('Error parsing AI response:', error);
                toast.error('Error processing feedback. Please try again.');
                setloading(false);
                return;
            }

            // Check if an answer already exists for this question in this interview
            const existingAnswer = await db
                .select()
                .from(UserAnswer)
                .where(
                    and(
                        eq(UserAnswer.mockIdRef, interviewData.mockId),
                        eq(UserAnswer.question, mockInterviewQuestion[activequestionindex]?.question || '')
                    )
                );

            let resp;
            const currentTime = moment().format('DD-MM-yyyy');
            const answerData = {
                mockIdRef: interviewData.mockId,
                question: mockInterviewQuestion[activequestionindex]?.question || '',
                correctAns: mockInterviewQuestion[activequestionindex]?.answer || '',
                userAns: userAnswer,
                feedback: JsonFeedbackResp?.feedback || '',
                rating: JsonFeedbackResp?.rating || '',
                userEmail: user?.primaryEmailAddress?.emailAddress || '',
                createdAt: currentTime
            };

            if (existingAnswer && existingAnswer.length > 0) {
                // Update existing answer
                resp = await db
                    .update(UserAnswer)
                    .set(answerData)
                    .where(
                        and(
                            eq(UserAnswer.mockIdRef, interviewData.mockId),
                            eq(UserAnswer.question, mockInterviewQuestion[activequestionindex]?.question || '')
                        )
                    );
                toast.success('Answer updated successfully');
            } else {
                // Insert new answer
                resp = await db.insert(UserAnswer).values(answerData);
                toast.success('Answer submitted successfully');
            }

            if (resp) {
                setAnswer('');
                setResults([]);
                setShowControls(false);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            toast.error('Error submitting answer. Please try again.');
        }
        setloading(false);
    }

    return (
        <div className='flex items-center justify-center flex-col w-full max-w-3xl mx-auto'>
            <div className='flex items-center justify-center flex-col w-full max-w-2xl mx-auto'>
                <div className='flex flex-col my-10 justify-center items-center bg-black rounded-lg p-5 w-full max-w-md'>
                    <Webcam 
                        mirrored={true}
                        className='rounded-lg w-full h-[300px] object-cover' 
                    />
                </div>
            </div>

            {/* Live Transcription Display */}
            <div className='w-full mb-6 min-h-[100px]'>
                <div className='border rounded-lg p-4 bg-white'>
                    <h3 className='text-sm font-medium mb-2 text-gray-500'>
                        {isRecording ? 'Recording... (Speaking)' : 'Your Response'}
                    </h3>
                    <p className='text-gray-800 min-h-[60px]'>
                        {userAnswer || 'Start recording to see your response here...'}
                    </p>
                </div>
            </div>

            <div className='flex gap-4 items-center'>
                {!showControls ? (
                    <Button disabled={loading} variant={isRecording ? "destructive" : "default"} 
                            onClick={StartStopRecording} className="min-w-[150px]">
                        {isRecording ? 
                            <h2 className='flex gap-2 items-center'><StopCircle/>Stop Recording</h2> :
                            <h2 className='flex gap-2 items-center'><Mic/>Start Recording</h2>
                        }
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" onClick={handleNewResponse} 
                                disabled={loading} className="flex gap-2 items-center">
                            <RefreshCcw size={16}/>New Response
                        </Button>
                        <Button variant="default" onClick={UpdateUserAnswer} 
                                disabled={loading} className="flex gap-2 items-center">
                            <Send size={16}/>Submit Answer
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}

export default RecordAnswerSection