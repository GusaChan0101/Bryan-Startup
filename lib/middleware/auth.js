// lib/middleware/auth.js
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Gera access token e refresh token
 */
export function generateTokens(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    plan: user.plan,
    is_admin: user.is_admin
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '15m' // Token de curta duração
  });

  const refreshToken = jwt.sign(
    { sub: user.id }, 
    JWT_REFRESH_SECRET, 
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Verifica e decodifica o token JWT
 */
export function verifyToken(token, isRefreshToken = false) {
  try {
    const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('INVALID_TOKEN');
    }
    throw error;
  }
}

/**
 * Extrai usuário da requisição com validação completa
 */
export async function getUserFromRequest(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'NO_TOKEN', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return { error: 'NO_TOKEN', status: 401 };
    }

    // Verificar se token está na blacklist (logout)
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return { error: 'TOKEN_REVOKED', status: 401 };
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (error.message === 'TOKEN_EXPIRED') {
        return { error: 'TOKEN_EXPIRED', status: 401 };
      }
      return { error: 'INVALID_TOKEN', status: 401 };
    }

    // Buscar usuário no banco
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    const user = await db.collection('users').findOne(
      { id: decoded.sub },
      { projection: { password: 0 } }
    );

    if (!user) {
      return { error: 'USER_NOT_FOUND', status: 404 };
    }

    return { user };

  } catch (error) {
    console.error('Auth error:', error);
    return { error: 'AUTH_ERROR', status: 500 };
  }
}

/**
 * Middleware de autenticação para rotas protegidas
 */
export async function requireAuth(request) {
  const result = await getUserFromRequest(request);
  
  if (result.error) {
    return NextResponse.json(
      { message: getErrorMessage(result.error) },
      { status: result.status }
    );
  }
  
  return result.user;
}

/**
 * Middleware para verificar se usuário é admin
 */
export async function requireAdmin(request) {
  const user = await requireAuth(request);
  
  if (user instanceof NextResponse) {
    return user; // Retornar erro de autenticação
  }
  
  if (!user.is_admin) {
    return NextResponse.json(
      { message: 'Acesso negado. Permissões de administrador necessárias.' },
      { status: 403 }
    );
  }
  
  return user;
}

/**
 * Blacklist de tokens (para logout)
 */
async function isTokenBlacklisted(token) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    const blacklisted = await db.collection('token_blacklist').findOne({ token });
    return !!blacklisted;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false;
  }
}

/**
 * Adicionar token à blacklist
 */
export async function blacklistToken(token, expiresAt) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    await db.collection('token_blacklist').insertOne({
      token,
      blacklistedAt: new Date(),
      expiresAt: new Date(expiresAt * 1000) // Timestamp JWT
    });

    // Criar índice TTL para limpar automaticamente
    await db.collection('token_blacklist').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
}

/**
 * Mensagens de erro amigáveis
 */
function getErrorMessage(errorCode) {
  const messages = {
    NO_TOKEN: 'Token de autenticação não fornecido',
    TOKEN_EXPIRED: 'Sessão expirada. Faça login novamente',
    INVALID_TOKEN: 'Token inválido',
    TOKEN_REVOKED: 'Token revogado',
    USER_NOT_FOUND: 'Usuário não encontrado',
    AUTH_ERROR: 'Erro de autenticação'
  };
  
  return messages[errorCode] || 'Erro de autenticação';
}