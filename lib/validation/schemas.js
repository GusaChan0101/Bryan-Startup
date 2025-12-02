// lib/validation/schemas.js
import { z } from 'zod';

/**
 * Schema para registro de usuário
 */
export const registerSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha muito longa')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter letras maiúsculas, minúsculas e números'
    )
});

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(1, 'Senha é obrigatória')
});

/**
 * Schema para criar plano de estudos
 */
export const createStudyPlanSchema = z.object({
  subject: z.string()
    .min(3, 'Assunto deve ter no mínimo 3 caracteres')
    .max(200, 'Assunto muito longo')
    .trim(),
  
  exam_date: z.string()
    .datetime('Data inválida')
    .refine((date) => {
      const examDate = new Date(date);
      const today = new Date();
      return examDate > today;
    }, 'Data da prova deve ser futura'),
  
  daily_hours: z.number()
    .min(1, 'Mínimo de 1 hora por dia')
    .max(12, 'Máximo de 12 horas por dia')
    .int('Horas devem ser um número inteiro'),
  
  difficulty_level: z.enum(['Iniciante', 'Médio', 'Avançado'], {
    errorMap: () => ({ message: 'Nível de dificuldade inválido' })
  }),
  
  banca: z.string()
    .min(2, 'Nome da banca muito curto')
    .max(100, 'Nome da banca muito longo')
    .trim()
    .optional(),
  
  escolaridade: z.enum(['Ensino Médio', 'Ensino Superior'], {
    errorMap: () => ({ message: 'Escolaridade inválida' })
  }),
  
  finalidade: z.string()
    .min(3, 'Finalidade muito curta')
    .max(200, 'Finalidade muito longa')
    .trim()
    .optional()
});

/**
 * Schema para atualizar perfil
 */
export const updateProfileSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo')
    .trim()
    .optional(),
  
  bio: z.string()
    .max(500, 'Bio muito longa')
    .trim()
    .optional(),
  
  avatar: z.string()
    .url('URL do avatar inválida')
    .optional()
    .or(z.literal(''))
});

/**
 * Schema para criar grupo
 */
export const createGroupSchema = z.object({
  name: z.string()
    .min(3, 'Nome do grupo muito curto')
    .max(100, 'Nome do grupo muito longo')
    .trim(),
  
  description: z.string()
    .min(10, 'Descrição muito curta')
    .max(500, 'Descrição muito longa')
    .trim(),
  
  subject: z.string()
    .min(2, 'Assunto muito curto')
    .max(100, 'Assunto muito longo')
    .trim()
    .optional(),
  
  isPrivate: z.boolean()
    .default(false)
});

/**
 * Schema para paginação
 */
export const paginationSchema = z.object({
  page: z.number()
    .int('Página deve ser um número inteiro')
    .positive('Página deve ser positiva')
    .default(1),
  
  limit: z.number()
    .int('Limite deve ser um número inteiro')
    .positive('Limite deve ser positivo')
    .max(100, 'Limite máximo é 100')
    .default(20)
});

/**
 * Middleware de validação
 */
export function validateRequest(schema) {
  return async (request) => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      return { data: validated, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          data: null,
          error: {
            message: 'Dados inválidos',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        };
      }
      throw error;
    }
  };
}

/**
 * Validação de query params
 */
export function validateQueryParams(schema, params) {
  try {
    return { data: schema.parse(params), error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: {
          message: 'Parâmetros inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }
      };
    }
    throw error;
  }
}