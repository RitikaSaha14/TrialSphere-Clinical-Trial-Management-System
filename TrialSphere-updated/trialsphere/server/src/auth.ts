import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'

const COOKIE = 'trialsphere_session'
const secret = () => process.env.JWT_SECRET || 'development-only-change-this-secret-before-deploying'
type SessionUser = { id: string; email: string; name: string; role: UserRole }
declare global { namespace Express { interface Request { user?: SessionUser } } }
export function setSession(res: Response, user: SessionUser) {
  const token = jwt.sign(user, secret(), { expiresIn: '8h' })
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000 })
}
export function clearSession(res: Response) { res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }) }
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE]
  if (!token) return res.status(401).json({ message: 'Authentication required' })
  try { req.user = jwt.verify(token, secret()) as SessionUser; next() }
  catch { clearSession(res); return res.status(401).json({ message: 'Session expired. Please sign in again.' }) }
}
export function allowRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have permission to perform this action' })
    next()
  }
}
