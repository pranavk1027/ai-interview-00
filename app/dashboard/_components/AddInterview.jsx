'use client'
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAimodal';
import { LoaderCircle } from 'lucide-react';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';


function AddInterview() {
  const [openDailog,setOpenDialog]=useState(false);
  const [jobPosition,setJobPosition]=useState();
  const [jobDesc,setJobdesc]=useState();
  const [jobExp,setjobexp]=useState();
  const [loading,setloading]=useState(false);
  const  [JsonResponse,setJsonResp]=useState([]);
  const {user}=useUser();

const router=useRouter();


  const onSubmit=async(e)=>{
    setloading(true);
     e.preventDefault();
     console.log(jobDesc,jobPosition,jobExp);

     const InputPrompt = "do not give any other things just give json for the following " + 
     "Job Position:" + jobPosition + 
     ", Job Description:" + jobDesc + 
     ", Years of Experience: " + jobExp + 
     ", Please generate 15 interview questions with answers in JSON Format. Include exactly:" +
     "5 basic level questions, 5 medium level questions, and 5 advanced level questions. " +
     "Each question object should have these fields: question, answer, difficulty (basic/medium/advanced). " +
     "Return only the JSON array.";

     const result=await chatSession.sendMessage(InputPrompt)
     const rawResponse = await result.response.text();
     console.log(rawResponse);
     
     const MockJsonResp=    rawResponse.trim().replace(/^```json|```$/g, '');
    setJsonResp(MockJsonResp);
     console.log(JSON.parse(MockJsonResp));

   if(MockJsonResp){
    const resp=await db.insert(MockInterview).values({
      mockId:uuidv4(),
      jsonMockResp:MockJsonResp,
      jobPosition:jobPosition,
      jobDesc:jobDesc,
      jobExperience:jobExp,
      createdBy:user?.primaryEmailAddress?.emailAddress,
      createdAt:moment().format('DD-MM-yyyy') 

     }).returning({mockId:MockInterview.mockId});

     console.log("Inserted Id:",resp);

     if(resp){
      setOpenDialog(false)
      router.push('/dashboard/interview/'+resp[0].mockId)
     }
   }
     
     setloading(false);
      
  }
  return (
   <div>
    <div onClick={()=>{setOpenDialog(true)}} className=' border p-10 rounded-lg hover:scale-105 hover:shadow-md cursor-pointer bg-secondary '>
      <h2 className='font-bold text-lg text-center '>+Add New</h2>
    </div>
    <Dialog open={openDailog}>
  
  <DialogContent className="max-w-xl">
    <DialogHeader>
      <DialogTitle className="text-2xl">Tell us more about your job interviewing</DialogTitle>
      <DialogDescription>
   
       
        Add Details about your job position,Job description and years of experience
   
        </DialogDescription>
        <form onSubmit={onSubmit} >
        <div className='mt-7 my-2'>
          <label >Job Role/Job Position</label>
          <Input placeholder="Ex. Full Stack Developer" required onChange={(event)=>{setJobPosition(event.target.value)}} ></Input>
        </div>
        <div className=' my-3'>
          <label >Job Desc/Tech Stack</label>
          <Textarea placeholder="Ex. React,Angular etc..."  onChange={(event)=>{setJobdesc(event.target.value)}}></Textarea>
        </div>
        <div className=' my-3'>
          <label >Year of Exp</label>
          <Input type="number" placeholder="Ex. 5" max="100" onChange={(event)=>{setjobexp(event.target.value)}} ></Input>
        </div>
        <div className='flex justify-end'>
          <Button type="button" onClick={()=>{setOpenDialog(false)}} variant="ghost">cancel</Button>
          <Button type="submit" disabled={loading} >
          {loading?<><LoaderCircle className='animate-spin'/>generating from AI</>:'start interview'}
          
          </Button>
        </div>
       </form>

    </DialogHeader>
  </DialogContent>
</Dialog>

   </div>
  )
}

export default AddInterview