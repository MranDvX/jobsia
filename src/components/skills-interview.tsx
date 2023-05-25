'use client'
import { useEffect, useRef, useState } from 'react'
import { Candidate, Interview } from '@/types'
import { INTERVIEW_TOTAL_QUESTIONS } from '@/utils/constants'
import { getByeMessage } from '@/utils/getByeMessage'
import { useStore } from '@/store'
import { saveInterview, startInterview } from '@/services/interview'
import { Speech } from './speech'

// Testing: 307777a5f54cd09d3b6440ddf7d98a

type SkillsInterviewProps = {
  candidate: Candidate
  position: string
  company: string
}

export function SkillsInterview({ candidate, position, company }: SkillsInterviewProps) {
  const initialMessage = `¡Bienvenido, ${candidate.name}! La siguiente entrevista será para el puesto ${position}.
  Durante la entrevista, exploraremos diferentes aspectos para evaluar tu idoneidad en el puesto. !Mucha suerte!`

  const [currentQuestion, setCurrentQuestion] = useState<string | undefined>(undefined)
  const [byeMessage, setByeMessage] = useState<string>('')
  const updateInterview = useStore((state) => state.updateInterview)
  const interview = useStore((state) => state.interview)
  const endInterviewStatus = useStore((state) => state.endInterviewStatus)
  const setEndInterviewStatus = useStore((state) => state.setEndInterviewStatus)
  const speechRef = useRef<SpeechSynthesisUtterance | undefined>(undefined)

  useEffect(() => {
    // https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
    if (!speechRef.current) {
      const utterance = new SpeechSynthesisUtterance()
      utterance.lang = 'es-US'
      utterance.rate = 0.8
      speechRef.current = utterance
    }
  }, [])

  useEffect(() => {
    if (speechRef.current) {
      speechRef.current.text = !currentQuestion ? initialMessage : currentQuestion
      speechSynthesis.speak(speechRef.current)
      speechRef.current.onend = () => {
        if (!currentQuestion) {
          setCurrentQuestion('¿Qué nos podrías contar sobre ti?')
        }
      }
    }
  }, [currentQuestion])

  useEffect(() => {
    if (!speechRef.current) return

    if (endInterviewStatus.isInterviewSaved) {
      speechRef.current.text = byeMessage
      speechSynthesis.speak(speechRef.current)
      speechRef.current.onend = () => {
        setEndInterviewStatus({
          isLastSpeech: true
        })
      }
    }
  }, [endInterviewStatus.isInterviewSaved, byeMessage])

  const sendAnswer = async (userAnswer: string) => {
    if (!userAnswer) return

    const questions = interview.map((intw) => intw.question)
    const payload = {
      candidate: candidate.name,
      position,
      company,
      currentQuestion,
      userAnswer,
      totalQuestions: interview.length,
      questions
    }
    const data = await startInterview(payload)
    /*
      Once I have score, feedback and answer, lets add them into the interview array.
      Then, update current question as long as the interview is not over.
    */
    const { feedback, score, next_question } = data
    // Update interview conversation
    const messageInterview: Interview = {
      question: currentQuestion!,
      answer: userAnswer,
      score,
      feedback
    }
    updateInterview(messageInterview)
    // Checking whether the interview is over or not, it adds +1 because at this point, the state was not updated yet
    if (interview.length + 1 === INTERVIEW_TOTAL_QUESTIONS) {
      // Saving interview's data in database
      const payloadEnd = {
        candidate,
        interviewDetails: interview.concat(messageInterview) // I do this because state is async, I guess there's a best way to do this
      }
      const responseEnd = await saveInterview(payloadEnd)
      // Means data was saved in the database
      if (responseEnd.ok) {
        // Time to show a loading message saying is the end
        setEndInterviewStatus({
          isInterviewSaved: true
        })
        // At this point, just set a bye message instead of next question
        setByeMessage(getByeMessage(position, company, candidate.name))
        return
      }
      // TODO: Show an error message
      return
    }
    // Update current question
    setCurrentQuestion(next_question)
  }

  return (
    <div className='flex flex-row gap-4 mt-8 h-[calc(100vh-220px)]'>
      <div className='text-yellow-300 text-xl xl:text-3xl w-1/2 grid place-items-center animate-fadeIn animate-duration-700 animate-delay-300'>
        <p className='italic text-center'>
          {byeMessage ? byeMessage : !currentQuestion ? initialMessage : currentQuestion}
        </p>
      </div>
      <Speech sendAnswer={sendAnswer} />
    </div>
  )
}
