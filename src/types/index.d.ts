export interface Company {
  id?: string
  name: string
  logo?: string
}

export interface Location {
  country: string
  province: string
}

export interface Skill {
  skill: string
}

export interface JobOffer {
  id: string
  title: string
  company: Company
  minRequirements: string
  location: Location
  contractType?: string
  experienceMin?: string
  applications?: number
  salaryDesc: string
  skillsList?: Skill[]
  studiesMin?: string
  teleworking?: string
}

export interface InitialPermissions {
  isMicrophoneEnabled: boolean
  isAssistantEnabled: boolean
}

export interface Interview {
  question: string
  answer: string
  score: number
  feedback: string
}

export interface Candidate {
  id: string
  name: string
  surname1: string
  surname2: string
  city: string
  photo: string
}

export interface EndInterviewStatus {
  isInterviewSaved?: boolean
  isLastSpeech?: boolean
}
