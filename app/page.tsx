'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookOpen, Upload, Play, CheckCircle, AlertCircle, Download, RefreshCw, ArrowRight, Clock, Award } from 'lucide-react'

// Type definitions
interface ExamQuestion {
  question_number: number
  question_text?: string
  statement?: string
  options?: { A: string; B: string; C: string; D: string }
  difficulty?: string
  expected_length?: string
}

interface MatchingItem {
  item_a: string
  item_b_id: string
}

interface MatchingOption {
  id: string
  text: string
}

interface ExamSection {
  section_title: string
  marks_per_question?: number
  total_marks?: number
  column_a_header?: string
  column_b_header?: string
  questions?: ExamQuestion[]
  items?: MatchingItem[]
  column_b_options?: MatchingOption[]
}

interface Exam {
  exam_title: string
  total_questions: number
  total_marks: number
  time_suggested_minutes: number
  difficulty_level: string
  sections: {
    mcq?: ExamSection
    fill_blank?: ExamSection
    true_false?: ExamSection
    short_answer?: ExamSection
    matching?: ExamSection
  }
  answer_key: any
}

interface HistoryItem {
  id: string
  topic: string
  date: string
  score: number
  totalMarks: number
}

interface ExamResult {
  score_summary: {
    total_marks_obtained: number
    total_marks_possible: number
    percentage: number
    grade: string
    grade_description: string
  }
  section_scores: any
  question_results: any
  performance_analysis: {
    strongest_sections: string[]
    weakest_sections: string[]
    topics_to_review: string[]
    overall_assessment: string
    improvement_suggestions: string[]
    encouragement: string
  }
  statistics: {
    questions_attempted: number
    questions_unanswered: number
    correct_answers: number
    incorrect_answers: number
    accuracy_rate: number
  }
}

// Dashboard Screen
function DashboardScreen() {
  const [examHistory, setExamHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('examHistory')
    if (savedHistory) {
      setExamHistory(JSON.parse(savedHistory))
    }
  }, [])

  const avgScore = examHistory.length > 0
    ? (examHistory.reduce((sum, exam) => sum + exam.score, 0) / examHistory.length).toFixed(1)
    : 0

  const bestScore = examHistory.length > 0
    ? Math.max(...examHistory.map(e => (e.score / e.totalMarks) * 100))
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-blue-600 font-medium mb-2">Total Exams Taken</p>
              <p className="text-3xl font-bold text-blue-900">{examHistory.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium mb-2">Average Score</p>
              <p className="text-3xl font-bold text-green-900">{avgScore}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-purple-600 font-medium mb-2">Best Performance</p>
              <p className="text-3xl font-bold text-purple-900">{bestScore.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {examHistory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Exam History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {examHistory.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{exam.topic}</p>
                    <p className="text-sm text-gray-500">{exam.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-white">
                      {exam.score}/{exam.totalMarks}
                    </Badge>
                    <Badge className={`${((exam.score / exam.totalMarks) * 100) >= 80 ? 'bg-green-500' : ((exam.score / exam.totalMarks) * 100) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {(((exam.score / exam.totalMarks) * 100).toFixed(1))}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No exams taken yet. Create your first exam to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Upload & Configuration Screen
function CreateExamScreen({ onExamCreated }: { onExamCreated: (exam: Exam, topic: string) => void }) {
  const [content, setContent] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [mcqCount, setMcqCount] = useState(10)
  const [fillBlankCount, setFillBlankCount] = useState(5)
  const [shortAnswerCount, setShortAnswerCount] = useState(3)
  const [difficulty, setDifficulty] = useState('Mixed')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [topic, setTopic] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setContent(text)
    }
    reader.readAsText(file)
  }

  const handleGenerateExam = async () => {
    if (!content.trim()) {
      setError('Please upload content or paste text')
      return
    }

    if (!topic.trim()) {
      setError('Please enter a topic name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a comprehensive exam based on these notes. Return ONLY valid JSON with the exact structure specified.\n\nNotes:\n${content}`,
          agent_id: '692f2dfb6b01be7c2f9f5387'
        })
      })

      const data = await response.json()

      if (data.success && data.response) {
        const exam: Exam = data.response.result || data.response
        onExamCreated(exam, topic)
      } else {
        setError('Failed to generate exam. Please try again.')
      }
    } catch (err) {
      setError('Error generating exam. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Content
            </CardTitle>
            <CardDescription>Upload your notes or paste text content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Topic Name *</label>
              <Input
                placeholder="e.g., Biology Chapter 5: Photosynthesis"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Upload File</label>
              <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100 transition">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900">
                    {uploadedFileName || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">PDF, DOCX, or TXT files</p>
                </div>
                <input
                  type="file"
                  hidden
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Or Paste Text Content</label>
              <Textarea
                placeholder="Paste your study notes here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Configuration</CardTitle>
            <CardDescription>Customize your exam parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Multiple Choice Questions</label>
                <span className="text-lg font-bold text-blue-600">{mcqCount}</span>
              </div>
              <Slider
                value={[mcqCount]}
                onValueChange={(value) => setMcqCount(value[0])}
                min={5}
                max={20}
                step={1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Fill in the Blanks</label>
                <span className="text-lg font-bold text-blue-600">{fillBlankCount}</span>
              </div>
              <Slider
                value={[fillBlankCount]}
                onValueChange={(value) => setFillBlankCount(value[0])}
                min={3}
                max={10}
                step={1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Short Answer Questions</label>
                <span className="text-lg font-bold text-blue-600">{shortAnswerCount}</span>
              </div>
              <Slider
                value={[shortAnswerCount]}
                onValueChange={(value) => setShortAnswerCount(value[0])}
                min={2}
                max={5}
                step={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Difficulty Level</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateExam}
              disabled={loading || !content.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 h-11"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block mr-2">⚙</span>
                  Generating Exam...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Exam
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Exam Taking Screen
function ExamScreen({ exam, topic, onSubmit }: { exam: Exam; topic: string; onSubmit: (answers: any, exam: Exam) => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<any>({
    mcq: {},
    fill_blank: {},
    true_false: {},
    short_answer: {},
    matching: {}
  })
  const [timeRemaining, setTimeRemaining] = useState(exam.time_suggested_minutes * 60)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const allQuestions = [
    ...(exam.sections.mcq?.questions || []).map((q: any) => ({ ...q, type: 'mcq', sectionTitle: exam.sections.mcq?.section_title })),
    ...(exam.sections.fill_blank?.questions || []).map((q: any) => ({ ...q, type: 'fill_blank', sectionTitle: exam.sections.fill_blank?.section_title })),
    ...(exam.sections.true_false?.questions || []).map((q: any) => ({ ...q, type: 'true_false', sectionTitle: exam.sections.true_false?.section_title })),
    ...(exam.sections.short_answer?.questions || []).map((q: any) => ({ ...q, type: 'short_answer', sectionTitle: exam.sections.short_answer?.section_title }))
  ]

  const currentQuestion = allQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100

  const handleAnswerChange = (key: string, value: any) => {
    const type = currentQuestion.type
    setAnswers(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [currentQuestion.question_number]: value
      }
    }))
  }

  const handleSubmitExam = async () => {
    setSubmitLoading(true)
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Evaluate this exam submission. Return ONLY valid JSON with the exact structure specified.\n\nExam Data: ${JSON.stringify(exam)}\n\nUser Answers: ${JSON.stringify(answers)}`,
          agent_id: '692f2e352bb6b2ddb3634ddd'
        })
      })

      const data = await response.json()
      if (data.success && data.response) {
        const result: ExamResult = data.response.result || data.response
        onSubmit(result, exam)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitLoading(false)
      setShowSubmitDialog(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-blue-900">{exam.exam_title}</h2>
              <p className="text-sm text-blue-700">{topic}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Clock className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <p className="text-lg font-bold text-blue-900">{formatTime(timeRemaining)}</p>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-blue-600 mt-2">Question {currentQuestionIndex + 1} of {allQuestions.length}</p>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <Badge variant="outline" className="mb-3">{currentQuestion.sectionTitle}</Badge>
              <h3 className="text-lg font-semibold mb-4">
                Q{currentQuestion.question_number}. {currentQuestion.question_text || currentQuestion.statement}
              </h3>

              {currentQuestion.type === 'mcq' && (
                <RadioGroup
                  value={answers.mcq[currentQuestion.question_number]?.toString() || ''}
                  onValueChange={(value) => handleAnswerChange('mcq', value)}
                >
                  <div className="space-y-3">
                    {Object.entries(currentQuestion.options || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value={key} id={`option-${key}`} />
                        <Label htmlFor={`option-${key}`} className="cursor-pointer flex-1">
                          <span className="font-medium text-gray-700">{key}.</span> {value}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.type === 'fill_blank' && (
                <Input
                  type="text"
                  placeholder="Type your answer here"
                  value={answers.fill_blank[currentQuestion.question_number] || ''}
                  onChange={(e) => handleAnswerChange('fill_blank', e.target.value)}
                  className="text-lg p-3"
                />
              )}

              {currentQuestion.type === 'true_false' && (
                <RadioGroup
                  value={answers.true_false[currentQuestion.question_number]?.toString() || ''}
                  onValueChange={(value) => handleAnswerChange('true_false', value === 'true')}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="true" id="option-true" />
                      <Label htmlFor="option-true" className="cursor-pointer flex-1">True</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="false" id="option-false" />
                      <Label htmlFor="option-false" className="cursor-pointer flex-1">False</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.type === 'short_answer' && (
                <Textarea
                  placeholder="Write your answer here..."
                  value={answers.short_answer[currentQuestion.question_number] || ''}
                  onChange={(e) => handleAnswerChange('short_answer', e.target.value)}
                  rows={5}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous
        </Button>

        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogTrigger asChild>
            {currentQuestionIndex === allQuestions.length - 1 && (
              <Button disabled={submitLoading} className="bg-green-600 hover:bg-green-700">
                {submitLoading ? 'Submitting...' : 'Submit Exam'}
              </Button>
            )}
          </DialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit your exam? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmitExam} className="bg-green-600">
                Submit
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          onClick={() => setCurrentQuestionIndex(Math.min(allQuestions.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === allQuestions.length - 1}
          variant="outline"
        >
          Next
        </Button>
      </div>

      {/* Question Navigator */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm font-medium mb-3">Jump to Question</p>
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
            {allQuestions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`p-2 rounded text-xs font-medium transition ${
                  currentQuestionIndex === idx
                    ? 'bg-blue-600 text-white'
                    : answers[allQuestions[idx].type]?.[allQuestions[idx].question_number]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Results Screen
function ResultsScreen({ result, exam, topic, onRetake }: { result: ExamResult; exam: Exam; topic: string; onRetake: () => void }) {
  const percentage = result.score_summary.percentage
  const gradeColor =
    percentage >= 90 ? 'text-green-600' :
    percentage >= 80 ? 'text-blue-600' :
    percentage >= 70 ? 'text-yellow-600' :
    'text-red-600'

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full border-4 border-blue-600 mx-auto mb-4 flex items-center justify-center bg-white">
              <div>
                <p className={`text-4xl font-bold ${gradeColor}`}>{percentage.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Score</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.score_summary.grade_description}</h2>
            <p className="text-lg text-gray-700">
              {result.score_summary.total_marks_obtained} / {result.score_summary.total_marks_possible}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Correct Answers</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">{result.statistics.correct_answers}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Incorrect Answers</p>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-lg font-bold text-red-600">{result.statistics.incorrect_answers}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Unanswered</p>
              <span className="text-lg font-bold text-gray-600">{result.statistics.questions_unanswered}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Section Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(result.section_scores).map(([section, data]: [string, any]) => (
              <div key={section}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium capitalize">{section.replace(/_/g, ' ')}</p>
                  <span className="font-bold text-blue-600">{data.percentage?.toFixed(1)}%</span>
                </div>
                <Progress value={data.percentage || 0} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Performance Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-gray-900 mb-2">Overall Assessment</p>
            <p className="text-gray-700">{result.performance_analysis.overall_assessment}</p>
          </div>

          {result.performance_analysis.improvement_suggestions.length > 0 && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Areas to Improve</p>
              <ul className="list-disc list-inside space-y-1">
                {result.performance_analysis.improvement_suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-gray-700 text-sm">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="font-medium text-gray-900 mb-1">Encouragement</p>
            <p className="text-gray-700 italic">{result.performance_analysis.encouragement}</p>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(result.question_results).map(([section, questions]: [string, any]) => (
              Array.isArray(questions) && questions.map((q: any, idx: number) => (
                <AccordionItem key={`${section}-${idx}`} value={`${section}-${idx}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      {q.is_correct ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Q{q.question_number}. {q.question_text || q.statement || section}</p>
                        <p className="text-xs text-gray-500">{q.marks_awarded}/{q.marks_possible} marks</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {q.user_answer && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Your Answer</p>
                        <p className={`text-sm p-2 rounded ${q.is_correct ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                          {q.user_answer}
                        </p>
                      </div>
                    )}
                    {!q.is_correct && q.correct_answer && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Correct Answer</p>
                        <p className="text-sm p-2 rounded bg-green-50 text-green-900">
                          {q.correct_answer}
                        </p>
                      </div>
                    )}
                    {q.feedback && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Feedback</p>
                        <p className="text-sm text-gray-700">{q.feedback}</p>
                      </div>
                    )}
                    {q.explanation && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Explanation</p>
                        <p className="text-sm text-gray-700">{q.explanation}</p>
                      </div>
                    )}
                    {q.key_points_covered && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Key Points Covered</p>
                        <ul className="text-sm list-disc list-inside space-y-1 text-green-700">
                          {q.key_points_covered.map((point: string, pidx: number) => (
                            <li key={pidx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {q.key_points_missed && q.key_points_missed.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Key Points Missed</p>
                        <ul className="text-sm list-disc list-inside space-y-1 text-red-700">
                          {q.key_points_missed.map((point: string, pidx: number) => (
                            <li key={pidx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onRetake} variant="outline" className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake Exam
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>
    </div>
  )
}

// Main App Component
export default function ExamGenApp() {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [currentExam, setCurrentExam] = useState<Exam | null>(null)
  const [currentTopic, setCurrentTopic] = useState('')
  const [examResult, setExamResult] = useState<ExamResult | null>(null)

  const handleExamCreated = (exam: Exam, topic: string) => {
    setCurrentExam(exam)
    setCurrentTopic(topic)
    setCurrentTab('take-exam')
  }

  const handleExamSubmit = (result: ExamResult, exam: Exam) => {
    setExamResult(result)
    setCurrentTab('results')

    // Save to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      topic: currentTopic,
      date: new Date().toLocaleDateString(),
      score: result.score_summary.total_marks_obtained,
      totalMarks: result.score_summary.total_marks_possible
    }

    const savedHistory = localStorage.getItem('examHistory')
    const history = savedHistory ? JSON.parse(savedHistory) : []
    history.unshift(historyItem)
    localStorage.setItem('examHistory', JSON.stringify(history))
  }

  const handleRetake = () => {
    setCurrentTab('create-exam')
    setCurrentExam(null)
    setExamResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ExamGen</h1>
                <p className="text-sm text-gray-600">AI-Powered Exam Generator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 hidden sm:block" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="create-exam" className="flex items-center gap-2">
              <Upload className="w-4 h-4 hidden sm:block" />
              <span className="hidden sm:inline">Create Exam</span>
              <span className="sm:hidden">Create</span>
            </TabsTrigger>
            <TabsTrigger value="take-exam" disabled={!currentExam} className="flex items-center gap-2">
              <Play className="w-4 h-4 hidden sm:block" />
              <span className="hidden sm:inline">Take Exam</span>
              <span className="sm:hidden">Exam</span>
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!examResult} className="flex items-center gap-2">
              <Award className="w-4 h-4 hidden sm:block" />
              <span className="hidden sm:inline">Results</span>
              <span className="sm:hidden">Review</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardScreen />
          </TabsContent>

          <TabsContent value="create-exam">
            <CreateExamScreen onExamCreated={handleExamCreated} />
          </TabsContent>

          <TabsContent value="take-exam">
            {currentExam && (
              <ExamScreen exam={currentExam} topic={currentTopic} onSubmit={handleExamSubmit} />
            )}
          </TabsContent>

          <TabsContent value="results">
            {examResult && currentExam && (
              <ResultsScreen result={examResult} exam={currentExam} topic={currentTopic} onRetake={handleRetake} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
