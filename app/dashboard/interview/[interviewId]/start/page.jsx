'use client'
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import QuestionSection from './_components/QuestionSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function start({params}) {
      const [interviewID,setid]=useState();
      const[interviewData,setInterviewData]=useState();
      const [MockInterviewQuestion,setquestion]=useState();
      const [activequestionindex,setactivequestion]=useState(0);

  useEffect( ()=>{

    async function fetchparams(){
      const ans=await params;
      setid(ans.interviewId)

     const result=await db.select().from(MockInterview)
             .where(eq(MockInterview.mockId,ans.interviewId))
          
             const jsonMockResp=JSON.parse(result[0].jsonMockResp);
             setquestion(jsonMockResp);
             console.log(jsonMockResp);
             setInterviewData(result[0]);
  }
  fetchparams();
},[params])


  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        <QuestionSection mockInterviewQuestion={MockInterviewQuestion} activequestionindex={activequestionindex} setactivequestion={setactivequestion}/>
     
     <RecordAnswerSection interviewData={interviewData} mockInterviewQuestion={MockInterviewQuestion} activequestionindex={activequestionindex}/>
     
      </div>
      <br></br>
      <div className='flex justify-end gap-6'>
     {activequestionindex >0 &&  
      <Button onClick={()=>setactivequestion(activequestionindex-1)}>Previous Question</Button>}
     {activequestionindex!=MockInterviewQuestion?.length-1 &&   
      <Button onClick={()=>setactivequestion(activequestionindex+1)} >Next Question</Button>}
     {activequestionindex==MockInterviewQuestion?.length-1 &&   
     <Link href={'/dashboard/interview/'+interviewData?.mockId+"/feedback"}>
       <Button
      
      >End Interview</Button></Link>
     }
      </div>
      
    </div>
  )
}

export default start