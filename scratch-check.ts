import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://frhaanszkeeyryznuuya.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaGFhbnN6a2VleXJ5em51dXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTc2MDIsImV4cCI6MjA5NzgzMzYwMn0.kgmk35IHZuiuKisdhk7h3baRERX3Wzb2ObDNN9ux0ro'
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data: exams, error: examsError } = await supabase.from('exams').select('id, title')
  if (examsError) {
    console.error('Error exams:', examsError)
    return
  }

  for (const exam of exams) {
    const { data: questions } = await supabase.from('questions').select('id, question_text, question_type').eq('exam_id', exam.id)
    console.log(`\n=== UJIAN: ${exam.title} ===`)
    if (questions && questions.length > 0) {
      let mcq = 0
      let essay = 0
      questions.forEach(q => {
        if (q.question_type === 'essay') essay++
        else mcq++
      })
      console.log(`- Pilihan Ganda: ${mcq}`)
      console.log(`- Esai: ${essay}`)
      
      if (essay > 0) {
         console.log('Sample essay question:', questions.find(q => q.question_type === 'essay')?.question_text)
      }
    } else {
      console.log('- Tidak ada soal')
    }
  }
}

main()
