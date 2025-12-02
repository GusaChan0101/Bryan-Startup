// lib/middleware/rate-limit.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * Rate limiter usando MongoDB (sem necessidade de Redis inicialmente)
 */
class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutos
    this.max = options.max || 100; // 100 requisições
    this.keyPrefix = options.keyPrefix || 'rl:';
  }

  /**
   * Gera chave única para o rate limit
   */
  getKey(identifier, route) {
    return `${this.keyPrefix}${route}:${identifier}`;
  }

  /**
   * Obtém identificador do usuário (IP ou userId)
   */
  getIdentifier(request, user = null) {
    // Priorizar userId se autenticado
    if (user?.id) {
      return `user:${user.id}`;
    }

    // Usar IP como fallback
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                request.headers.get('x-real-ip') ||
                'unknown';
    
    return `ip:${ip}`;
  }

  /**
   * Verifica e atualiza rate limit
   */
  async check(request, route, user = null) {
    try {
      const identifier = this.getIdentifier(request, user);
      const key = this.getKey(identifier, route);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      const client = await clientPromise;
      const db = client.db(process.env.DB_NAME);
      const collection = db.collection('rate_limits');

      // Criar índice TTL na primeira vez
      await collection.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
      );

      // Buscar registro existente
      const record = await collection.findOne({ key });

      if (!record) {
        // Primeira requisição - criar registro
        await collection.insertOne({
          key,
          requests: [{
            timestamp: now,
            path: new URL(request.url).pathname
          }],
          expiresAt: new Date(now + this.windowMs)
        });

        return {
          success: true,
          limit: this.max,
          remaining: this.max - 1,
          reset: Math.ceil((now + this.windowMs) / 1000)
        };
      }

      // Filtrar requisições dentro da janela de tempo
      const recentRequests = record.requests.filter(
        req => req.timestamp > windowStart
      );

      if (recentRequests.length >= this.max) {
        // Limite excedido
        const oldestRequest = recentRequests[0].timestamp;
        const resetTime = Math.ceil((oldestRequest + this.windowMs) / 1000);

        return {
          success: false,
          limit: this.max,
          remaining: 0,
          reset: resetTime,
          retryAfter: Math.ceil((oldestRequest + this.windowMs - now) / 1000)
        };
      }

      // Adicionar nova requisição
      recentRequests.push({
        timestamp: now,
        path: new URL(request.url).pathname
      });

      await collection.updateOne(
        { key },
        {
          $set: {
            requests: recentRequests,
            expiresAt: new Date(now + this.windowMs)
          }
        }
      );

      return {
        success: true,
        limit: this.max,
        remaining: this.max - recentRequests.length,
        reset: Math.ceil((now + this.windowMs) / 1000)
      };

    } catch (error) {
      console.error('Rate limit error:', error);
      // Em caso de erro, permitir requisição (fail-open)
      return { success: true };
    }
  }
}

/**
 * Rate limiters pré-configurados
 */
export const rateLimiters = {
  // Login - 5 tentativas por 15 minutos
  login: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyPrefix: 'rl:login:'
  }),

  // Registro - 3 contas por hora por IP
  register: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyPrefix: 'rl:register:'
  }),

  // API geral - 100 requisições por 15 minutos
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyPrefix: 'rl:api:'
  }),

  // Criação de planos - 10 por hora (para evitar abuso da IA)
  createPlan: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyPrefix: 'rl:plan:'
  }),

  // Strict - Para endpoints sensíveis
  strict: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 20,
    keyPrefix: 'rl:strict:'
  })
};

/**
 * Middleware de rate limiting
 */
export async function rateLimit(limiter, request, user = null) {
  const route = new URL(request.url).pathname;
  const result = await limiter.check(request, route, user);

  if (!result.success) {
    return NextResponse.json(
      {
        message: 'Muitas requisições. Tente novamente mais tarde.',
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: result.retryAfter
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit?.toString() || '',
          'X-RateLimit-Remaining': result.remaining?.toString() || '0',
          'X-RateLimit-Reset': result.reset?.toString() || '',
          'Retry-After': result.retryAfter?.toString() || '60'
        }
      }
    );
  }

  // Adicionar headers informativos
  return {
    headers: {
      'X-RateLimit-Limit': result.limit?.toString() || '',
      'X-RateLimit-Remaining': result.remaining?.toString() || '',
      'X-RateLimit-Reset': result.reset?.toString() || ''
    }
  };
}

/**
 * Helper para aplicar rate limit em rotas
 */
export function withRateLimit(limiter) {
  return async (request, user = null) => {
    const result = await rateLimit(limiter, request, user);
    
    if (result instanceof NextResponse) {
      return result; // Retornar erro 429
    }
    
    return result.headers; // Retornar headers para adicionar na resposta
  };
}

// Exemplo de uso:
// const headers = await withRateLimit(rateLimiters.login)(request);
// if (headers instanceof NextResponse) return headers;