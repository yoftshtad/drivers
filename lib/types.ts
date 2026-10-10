export type ModuleId = 'traffic-signs' | 'road-rules' | 'defensive-driving' | 'vehicle-knowledge'

export type ModuleColor = 'blue' | 'orange' | 'green' | 'purple'

export type QuestionType = 'single' | 'truefalse'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type AccessState = 'pending' | 'active' | 'rejected'

export type UserRole = 'student' | 'admin'

export interface SessionUser {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  access: AccessState
}

export interface Lesson {
  id: string
  title: string
  duration: string
  type: 'video' | 'reading'
  completed: boolean
  summary: string
}

export interface ContentSection {
  heading: string
  paragraphs: string[]
}

export interface ModuleContent {
  fileName: string
  pages: number
  words: number
  sections: ContentSection[]
}

export interface LearningModule {
  id: ModuleId | string
  order: number
  title: string
  description: string
  color: ModuleColor
  progress: number
  questionCount: number
  lessons: Lesson[]
  content?: ModuleContent
}

export interface Question {
  id: string
  moduleId: string
  type: QuestionType
  text: string
  options: string[]
  correct: number[]
  difficulty: Difficulty
  explanation: string
}

export interface Questionnaire {
  id: string
  moduleId: string
  title: string
  description: string
  questionCount: number
  timeLimitMin: number
  passMark: number
  mode: 'practice' | 'mock'
}

export interface PaymentRecord {
  id: string
  userName: string
  userEmail: string
  userPhone?: string
  plan: string
  amount: number
  reference: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reason?: string
  receiptName: string
  receiptUrl?: string
}

export interface AttemptRecord {
  id: string
  questionnaireTitle: string
  mode: 'practice' | 'mock'
  score: number
  total: number
  percent: number
  passed: boolean
  completedAt: string
  weakCategories: string[]
}
