export type Question = {
  id: string;
  correct_answer: string | null;
  [key: string]: unknown;
};

export type Answer = {
  question_id: string;
  answer: string;
  [key: string]: unknown;
};

/**
 * Calculates the score of an exam based on student answers and correct answers.
 * Returns a score between 0 and 100.
 */
export function calculateExamScore(questions: Question[], studentAnswers: Answer[]): number {
  if (!questions || questions.length === 0) return 0;
  if (!studentAnswers || studentAnswers.length === 0) return 0;

  let correctCount = 0;

  for (const question of questions) {
    if (!question.correct_answer) continue;

    const studentAnswer = studentAnswers.find((a) => a.question_id === question.id);
    
    // We trim and compare ignoring case for robustness, especially if it was an option letter or text.
    if (studentAnswer && studentAnswer.answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()) {
      correctCount++;
    }
  }

  return Math.round((correctCount / questions.length) * 100);
}
