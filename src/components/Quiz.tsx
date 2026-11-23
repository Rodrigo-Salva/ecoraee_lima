import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import quizData from '../data/quiz.json'
import type { QuizQuestion } from '../types'
import { useApp } from '../context/AppContext'

const questions = quizData as QuizQuestion[]

export default function Quiz() {
  const { quizBestScore, saveQuizScore } = useApp()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const finished = index >= questions.length
  const question = questions[index]
  useEffect(() => { if (finished) saveQuizScore(score) }, [finished, saveQuizScore, score])

  const answer = (optionIndex: number) => {
    if (selected !== null || !question) return
    setSelected(optionIndex)
    if (optionIndex === question.correctIndex) setScore((value) => value + 1)
  }
  const next = () => { setIndex((value) => value + 1); setSelected(null) }
  const reset = () => { setIndex(0); setSelected(null); setScore(0) }

  if (finished) return (
    <div className="card p-6 text-center sm:p-8">
      <p className="eyebrow">Resultado</p>
      <p className="mt-3 text-4xl font-bold text-forest">{score} de {questions.length}</p>
      <p className="mt-3 text-slate-600">{score >= 4 ? '¡Excelente! Ya puedes tomar mejores decisiones sobre tus RAEE.' : 'Buen intento. Revisa la guía y vuelve a probar.'}</p><p className="mt-2 text-sm font-semibold text-petrol">Mejor puntaje guardado: {Math.max(score, quizBestScore)} de {questions.length}</p>
      <button type="button" className="btn-secondary mt-6" onClick={reset}><RotateCcw className="h-4 w-4" />Intentar otra vez</button>
    </div>
  )

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-500"><span>Pregunta {index + 1} de {questions.length}</span><span>{score} puntos</span></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-eco transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      <h3 className="mt-6 text-xl font-bold text-slate-950">{question.question}</h3>
      <div className="mt-5 grid gap-3">
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === question.correctIndex
          const isSelected = selected === optionIndex
          const revealedClass = selected === null ? 'border-slate-200 hover:border-forest' : isCorrect ? 'border-emerald-500 bg-emerald-50' : isSelected ? 'border-red-400 bg-red-50' : 'border-slate-200 opacity-60'
          return <button key={option} type="button" className={`flex min-h-12 items-center justify-between rounded-xl border p-3 text-left font-semibold transition ${revealedClass}`} onClick={() => answer(optionIndex)} disabled={selected !== null}>{option}{selected !== null && isCorrect && <CheckCircle2 className="h-5 w-5 text-forest" />}{selected !== null && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}</button>
        })}
      </div>
      {selected !== null && <div className="mt-5 rounded-xl bg-slate-100 p-4"><p className="font-semibold text-slate-800">{question.explanation}</p><button type="button" className="btn-primary mt-4" onClick={next}>{index === questions.length - 1 ? 'Ver resultado' : 'Siguiente pregunta'}</button></div>}
    </div>
  )
}
