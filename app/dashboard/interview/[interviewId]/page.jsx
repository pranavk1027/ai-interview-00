'use client'
import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { Lightbulb, WebcamIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam';

function interview({params}) {
    const [interviewID,setid]=useState();
    const[interviewData,setInterviewData]=useState();
    const [webCamEnabled,setwebcamenable]=useState(false);
    useEffect(()=>{
   
        async function fetchparams(){
         const ans=await params;
         setid(ans.interviewId)
         /**
          * 
          * used to get interview details
          */
         const result=await db.select().from(MockInterview)
         .where(eq(MockInterview.mockId,ans.interviewId))
      
         console.log(result[0]);
         setInterviewData(result[0]);
         
        }

        fetchparams();
       
    },[params])
     
    
   
 

 

  return (
    <div className='my-10  '>
    <h2 className='font-bold text-2xl'>Let's get Started</h2>
   
   <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
   
   

   <div className='flex flex-col my-5 gap-5'>
  <div className=' p-5  rounded-lg border'>
  {interviewData ? (
                   <> <h2 className='text-lg'><strong>Job Role/Position:</strong> {interviewData.jobPosition}</h2>
                   <h2 className='text-lg'><strong>Job Description/Tech Stack:</strong> {interviewData.jobDesc}</h2>
                   <h2 className='text-lg'><strong>Years of Experience:</strong> {interviewData.jobExperience}</h2>
              </> ) : (
                    <h2>Loading interview details...</h2>)
                }
  </div>
  <div className='p-5 border rounded-lg border-yellow-300  bg-yellow-100'>
    <h2 className='flex gap-2 items-center text-yellow-500'><Lightbulb/><strong>Information</strong></h2>
    <h2 className='mt-3'>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
    
  </div>
 </div>
 <div className='flex flex-col'>
    {webCamEnabled?<Webcam mirrored={true}
    onUserMedia={()=>setwebcamenable(true)}
    onUserMediaError={()=>setwebcamenable(false)}
    style={{height:300,width:300}}
    />:
    
    <>
    <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary'></WebcamIcon>
    <Button  onClick={()=>setwebcamenable(true)}>Enable Web Cam and Microphone</Button>
    </>
    
    }
   </div>
   </div>
   <div className='flex justify-end items-end mt-10'>
  <Link href={'/dashboard/interview/'+interviewID+'/start'}>
  <Button  >Start</Button>
  </Link>
   </div>
    </div>
  )
}

export default interview