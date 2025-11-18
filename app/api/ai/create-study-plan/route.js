import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest } from '@/lib/auth';

async function generateLessonBatch(ai, plan_data, startDay, numLessons) {
  const prompt = `Você é um especialista em criar cronogramas educacionais detalhados e completos.

Crie ${numLessons} aulas educacionais para:
- Assunto: ${plan_data.subject}
- Banca: ${plan_data.banca}
- Escolaridade: ${plan_data.escolaridade}
- Nível: ${plan_data.difficulty_level}
- Começando no dia: ${startDay}

Cada aula DEVE ter:
1. **id**: um UUID v4 único
2. **day**: número do dia (começando em ${startDay})
3. **title**: Título específico e conciso da aula (máximo de 10 palavras)
4. **detailed_content**: Conteúdo educacional claro e objetivo de 300-400 palavras que ENSINE o tópico diretamente. Não use saudações ou introduções.
5. **questions**: 3 questões de múltipla escolha no formato JSON correto, com 4 opções cada.

CRÍTICO: Retorne APENAS JSON válido, sem markdown ou qualquer outro texto.
Formato: {"lessons": [...]}

Exemplo:
{
  "lessons": [
    {
      "id": "${uuidv4()}",
      "day": ${startDay},
      "title": "Introdução à Análise Sintática",
      "detailed_content": "A análise sintática é o estudo da função das palavras em uma oração...",
      "questions": [
        {
          "question": "Qual a função do sujeito na oração?",
          "options": ["A) Praticar a ação", "B) Sofrer a ação", "C) Complementar o verbo", "D) Indicar uma circunstância"],
          "correct_answer": "A"
        }
      ]
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
      responseMimeType: "application/json",
    },
  });

  let text;
  try {
    text = response.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    console.error('Error getting text from AI response:', e);
    console.error('Full AI response:', response);
    throw new Error('Invalid response from AI');
  }

  text = text.replace(/^```json\s*/g, '').replace(/\s*```$/g, '');
  text = text.replace(/[\x00-\x1F\x7F]/g, '');

  let parsed_json;
  try {
    parsed_json = JSON.parse(text);
  } catch (e) {
    console.error("Erro ao decodificar JSON:", text);
    throw new Error("A resposta da IA não é um JSON válido.");
  }

  if (!parsed_json.lessons || !Array.isArray(parsed_json.lessons)) {
    throw new Error("A resposta da IA não contém a lista de aulas esperada.");
  }

  // Validar cada aula individualmente
  parsed_json.lessons.forEach(lesson => {
    if (!lesson.title || !lesson.detailed_content || !lesson.questions || lesson.questions.length === 0) {
      throw new Error("Aula gerada está incompleta ou mal formatada.");
    }
  });

  return parsed_json;
}

export async function POST(request) {
  try {
    const plan_data = await request.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY
    });

    let days_until_exam = 30;
    try {
      const exam_date = new Date(plan_data.exam_date);
      const today = new Date();
      const diffTime = Math.abs(exam_date - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        days_until_exam = diffDays;
      }
    } catch (e) {
      console.error('Erro ao calcular dias:', e);
    }

    const lessons_per_day = 4;
    const total_lessons = Math.min(days_until_exam * lessons_per_day, 40);
    const batch_size = 5; // Gerar 5 aulas por vez
    const num_batches = Math.ceil(total_lessons / batch_size);

    console.log(`Gerando ${total_lessons} aulas em ${num_batches} lotes...`);

    const all_lessons = [];

    // Gerar aulas em lotes
    for (let i = 0; i < num_batches; i++) {
      const start_day = Math.floor((i * batch_size) / lessons_per_day) + 1;
      const lessons_in_batch = Math.min(batch_size, total_lessons - all_lessons.length);
      
      console.log(`Gerando lote ${i + 1}/${num_batches} (${lessons_in_batch} aulas, começando no dia ${start_day})...`);
      
      const batch_result = await generateLessonBatch(
        ai,
        plan_data,
        start_day,
        lessons_in_batch
      );

      if (batch_result.lessons && Array.isArray(batch_result.lessons)) {
        // Garantir que cada aula tenha um ID único
        batch_result.lessons.forEach((lesson, index) => {
          lesson.id = lesson.id || uuidv4();
          lesson.day = start_day + Math.floor(index / lessons_per_day);
          lesson.completed = false;
        });
        
        all_lessons.push(...batch_result.lessons);
        console.log(`Lote ${i + 1} concluído. Total de aulas: ${all_lessons.length}`);
      } else {
        throw new Error("O lote de aulas gerado está vazio ou em formato inválido.");
      }

      // Pequeno delay entre lotes para evitar rate limiting
      if (i < num_batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (all_lessons.length === 0) {
      throw new Error('Nenhuma aula foi gerada com sucesso');
    }

    console.log(`Total de aulas geradas: ${all_lessons.length}`);

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    // Check if user is on Free plan and has existing study plans
    if (user.plan === 'Free') {
      const existingPlanCount = await db.collection('study_plans').countDocuments({ user_id: user.id });
      if (existingPlanCount >= 1) {
        return NextResponse.json(
          { message: 'Usuários do plano gratuito podem criar apenas um plano de estudos. Faça upgrade para o plano Pro para criar mais.' },
          { status: 403 }
        );
      }
    }

    const study_plan = {
      id: uuidv4(),
      user_id: user.id, // Associar o plano ao usuário
      subject: plan_data.subject,
      exam_date: plan_data.exam_date,
      daily_hours: plan_data.daily_hours,
      difficulty_level: plan_data.difficulty_level,
      banca: plan_data.banca,
      escolaridade: plan_data.escolaridade,
      finalidade: plan_data.finalidade,
      lessons: all_lessons,
      created_at: new Date(),
    };

    await db.collection('study_plans').insertOne(study_plan);

    console.log('Plano de estudos salvo com sucesso!');

    return NextResponse.json(study_plan);

  } catch (error) {
    console.error('AI Study Plan API Error:', error);
    return NextResponse.json({ 
      message: 'Erro ao criar cronograma', 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
}