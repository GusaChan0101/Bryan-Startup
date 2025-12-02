// lib/services/study-plan.service.js
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/mongodb';

/**
 * Serviço de geração de planos de estudo
 */
class StudyPlanService {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY
    });
    this.maxRetries = 3;
    this.batchSize = 5;
  }

  /**
   * Verifica se usuário pode criar mais planos
   */
  async canCreatePlan(userId, userPlan) {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    if (userPlan === 'Free') {
      const count = await db.collection('study_plans')
        .countDocuments({ user_id: userId });
      
      return {
        allowed: count < 1,
        limit: 1,
        current: count
      };
    }
    
    // Plano Pro - sem limite
    return {
      allowed: true,
      limit: -1,
      current: 0
    };
  }

  /**
   * Gera um lote de aulas com retry
   */
  async generateLessonBatch(planData, startDay, numLessons, retryCount = 0) {
    const prompt = this.buildPrompt(planData, startDay, numLessons);

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          responseMimeType: "application/json",
        },
      });

      const text = response.candidates[0].content.parts[0].text.trim();
      const cleaned = this.cleanJsonResponse(text);
      const parsed = JSON.parse(cleaned);

      if (!this.validateLessons(parsed.lessons)) {
        throw new Error('Aulas geradas em formato inválido');
      }

      return parsed;

    } catch (error) {
      console.error(`Erro ao gerar lote (tentativa ${retryCount + 1}):`, error);

      if (retryCount < this.maxRetries) {
        // Backoff exponencial: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.generateLessonBatch(planData, startDay, numLessons, retryCount + 1);
      }

      throw new Error(`Falha ao gerar aulas após ${this.maxRetries} tentativas: ${error.message}`);
    }
  }

  /**
   * Constrói o prompt para a IA
   */
  buildPrompt(planData, startDay, numLessons) {
    return `Você é um especialista em criar cronogramas educacionais detalhados e completos.

Crie ${numLessons} aulas educacionais para:
- Assunto: ${planData.subject}
- Banca: ${planData.banca}
- Escolaridade: ${planData.escolaridade}
- Nível: ${planData.difficulty_level}
- Começando no dia: ${startDay}

Cada aula DEVE ter:
1. **id**: um UUID v4 único
2. **day**: número do dia (começando em ${startDay})
3. **title**: Título específico e conciso da aula (máximo de 10 palavras)
4. **detailed_content**: Conteúdo educacional claro e objetivo de 300-400 palavras que ENSINE o tópico diretamente. Não use saudações ou introduções.
5. **questions**: 3 questões de múltipla escolha no formato JSON correto, com 4 opções cada.

CRÍTICO: Retorne APENAS JSON válido, sem markdown ou qualquer outro texto.
Formato: {"lessons": [...]}

Exemplo de uma aula:
{
  "lessons": [
    {
      "id": "${uuidv4()}",
      "day": ${startDay},
      "title": "Introdução à Análise Sintática",
      "detailed_content": "A análise sintática é o estudo da função das palavras em uma oração. Cada palavra desempenha um papel específico na construção do sentido...",
      "questions": [
        {
          "question": "Qual a função do sujeito na oração?",
          "options": ["A) Praticar a ação", "B) Sofrer a ação", "C) Complementar o verbo", "D) Indicar uma circunstância"],
          "correct_answer": "A"
        },
        {
          "question": "O predicado contém qual elemento obrigatório?",
          "options": ["A) Sujeito", "B) Verbo", "C) Objeto", "D) Adjunto"],
          "correct_answer": "B"
        },
        {
          "question": "Qual tipo de predicado contém verbo de ligação?",
          "options": ["A) Verbal", "B) Nominal", "C) Verbo-nominal", "D) Composto"],
          "correct_answer": "B"
        }
      ]
    }
  ]
}`;
  }

  /**
   * Limpa resposta JSON da IA
   */
  cleanJsonResponse(text) {
    return text
      .replace(/^```json\s*/g, '')
      .replace(/\s*```$/g, '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .trim();
  }

  /**
   * Valida estrutura das aulas
   */
  validateLessons(lessons) {
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return false;
    }

    return lessons.every(lesson => {
      return lesson.id &&
             typeof lesson.day === 'number' &&
             lesson.title &&
             lesson.detailed_content &&
             Array.isArray(lesson.questions) &&
             lesson.questions.length >= 3 &&
             lesson.questions.every(q => 
               q.question && 
               Array.isArray(q.options) && 
               q.options.length === 4 &&
               q.correct_answer
             );
    });
  }

  /**
   * Calcula número de dias até o exame
   */
  calculateDaysUntilExam(examDate) {
    try {
      const exam = new Date(examDate);
      const today = new Date();
      const diffTime = Math.abs(exam - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 30; // Default 30 dias
    } catch (error) {
      console.error('Erro ao calcular dias:', error);
      return 30;
    }
  }

  /**
   * Gera plano completo
   */
  async generateCompletePlan(planData, userId) {
    // Calcular parâmetros
    const daysUntilExam = this.calculateDaysUntilExam(planData.exam_date);
    const lessonsPerDay = 4;
    const totalLessons = Math.min(daysUntilExam * lessonsPerDay, 40);
    const numBatches = Math.ceil(totalLessons / this.batchSize);

    console.log(`Gerando ${totalLessons} aulas em ${numBatches} lotes para usuário ${userId}`);

    const allLessons = [];
    let generatedCount = 0;

    // Gerar aulas em lotes
    for (let i = 0; i < numBatches; i++) {
      const startDay = Math.floor((i * this.batchSize) / lessonsPerDay) + 1;
      const lessonsInBatch = Math.min(this.batchSize, totalLessons - generatedCount);

      console.log(`Lote ${i + 1}/${numBatches}: ${lessonsInBatch} aulas, dia ${startDay}`);

      try {
        const batch = await this.generateLessonBatch(
          planData,
          startDay,
          lessonsInBatch
        );

        // Processar aulas do lote
        batch.lessons.forEach((lesson, index) => {
          lesson.id = lesson.id || uuidv4();
          lesson.day = startDay + Math.floor((generatedCount + index) / lessonsPerDay);
          lesson.completed = false;
        });

        allLessons.push(...batch.lessons);
        generatedCount += batch.lessons.length;

        console.log(`Lote ${i + 1} concluído. Total: ${allLessons.length} aulas`);

        // Pequeno delay entre lotes
        if (i < numBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Falha no lote ${i + 1}:`, error);
        // Continuar com as aulas já geradas
        break;
      }
    }

    if (allLessons.length === 0) {
      throw new Error('Nenhuma aula foi gerada com sucesso');
    }

    return allLessons;
  }

  /**
   * Cria e salva plano de estudos
   */
  async createStudyPlan(planData, userId) {
    try {
      // Gerar aulas
      const lessons = await this.generateCompletePlan(planData, userId);

      // Criar objeto do plano
      const studyPlan = {
        id: uuidv4(),
        user_id: userId,
        subject: planData.subject,
        exam_date: planData.exam_date,
        daily_hours: planData.daily_hours,
        difficulty_level: planData.difficulty_level,
        banca: planData.banca || '',
        escolaridade: planData.escolaridade,
        finalidade: planData.finalidade || '',
        lessons: lessons,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Salvar no banco
      const client = await clientPromise;
      const db = client.db(process.env.DB_NAME);
      
      await db.collection('study_plans').insertOne(studyPlan);

      console.log(`Plano ${studyPlan.id} salvo com ${lessons.length} aulas`);

      return studyPlan;

    } catch (error) {
      console.error('Erro ao criar plano:', error);
      throw error;
    }
  }

  /**
   * Atualiza progresso de uma aula
   */
  async updateLessonProgress(planId, lessonId, completed, userId) {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const result = await db.collection('study_plans').updateOne(
      {
        id: planId,
        user_id: userId,
        'lessons.id': lessonId
      },
      {
        $set: {
          'lessons.$.completed': completed,
          'lessons.$.completed_at': completed ? new Date() : null,
          updated_at: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Obtém estatísticas do plano
   */
  async getPlanStats(planId, userId) {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const plan = await db.collection('study_plans').findOne({
      id: planId,
      user_id: userId
    });

    if (!plan) {
      return null;
    }

    const totalLessons = plan.lessons.length;
    const completedLessons = plan.lessons.filter(l => l.completed).length;
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      totalLessons,
      completedLessons,
      progress: Math.round(progress),
      daysUntilExam: this.calculateDaysUntilExam(plan.exam_date),
      dailyGoal: Math.ceil(totalLessons / this.calculateDaysUntilExam(plan.exam_date))
    };
  }
}

// Exportar instância singleton
export const studyPlanService = new StudyPlanService();