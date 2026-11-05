import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import { Prisma, StudyStatus, ParticipantStatus, UserRole } from '@prisma/client'
import { prisma } from './db.js'
import { z } from 'zod'
import { allowRoles, clearSession, requireAuth, setSession } from './auth.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'TrialSphere API' }))

const credentials = z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(8) })
app.post('/api/auth/register', async (req, res, next) => { try {
  const input = credentials.extend({ name: z.string().min(2).max(80) }).parse(req.body)
  const count = await prisma.user.count()
  const user = await prisma.user.create({ data: { name: input.name, email: input.email, passwordHash: await bcrypt.hash(input.password, 12), role: count === 0 ? UserRole.ADMIN : UserRole.INVESTIGATOR } })
  const session = { id: user.id, name: user.name, email: user.email, role: user.role }; setSession(res, session); res.status(201).json({ user: session })
} catch (e) { next(e) } })
app.post('/api/auth/login', async (req, res, next) => { try {
  const input = credentials.parse(req.body); const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' })
  const session = { id: user.id, name: user.name, email: user.email, role: user.role }; setSession(res, session); res.json({ user: session })
} catch (e) { next(e) } })
app.post('/api/auth/logout', (_req, res) => { clearSession(res); res.status(204).end() })
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.user }))

app.use('/api', (req, res, next) => req.path === '/health' || req.path.startsWith('/auth/') ? next() : requireAuth(req, res, next))
app.get('/api/dashboard/stats', async (_req, res, next) => { try {
  const studies = await prisma.study.findMany(); const [sites, participants] = await Promise.all([prisma.site.count({ where: { status: 'Active' } }), prisma.participant.count({ where: { status: ParticipantStatus.Enrolled } })])
  const activeStudies = studies.filter(s => [StudyStatus.Active, StudyStatus.Recruiting].includes(s.status)).length
  const target = studies.reduce((n, s) => n + s.targetEnrollment, 0); const enrolled = studies.reduce((n, s) => n + s.currentEnrollment, 0)
  const trend = [{month:'Jan',enrolled:120,target:145},{month:'Feb',enrolled:185,target:190},{month:'Mar',enrolled:260,target:245},{month:'Apr',enrolled:335,target:310},{month:'May',enrolled:430,target:390},{month:'Jun',enrolled:510,target:475}]
  const statusBreakdown = ['Recruiting','Active','Planning','Completed'].map(name => ({ name, value: studies.filter(s => s.status.replace('_',' ') === name).length }))
  res.json({ activeStudies, activeSites: sites, enrolledParticipants: enrolled || participants, enrollmentTarget: target, trend, statusBreakdown })
} catch(e) { next(e) } })

const studyInput = z.object({ protocolCode:z.string().min(3).max(30), title:z.string().min(3).max(160), phase:z.string().min(2), status:z.enum(['Recruiting','Active','Planning','Completed','On Hold']).default('Planning'), targetEnrollment:z.number().int().positive(), currentEnrollment:z.number().int().nonnegative().default(0), startDate:z.string().datetime() })
const pageParams = (req: express.Request) => ({ page: Math.max(1, Number(req.query.page) || 1), limit: Math.min(100, Math.max(1, Number(req.query.limit) || 10)) })
app.get('/api/studies', async (req,res,next) => { try {
  const {page,limit}=pageParams(req); const q=String(req.query.q||''); const status=String(req.query.status||'All')
  const where: Prisma.StudyWhereInput = { ...(q ? { OR:[{title:{contains:q,mode:'insensitive'}},{protocolCode:{contains:q,mode:'insensitive'}}] } : {}), ...(status!=='All' ? {status:status.replace(' ','_') as StudyStatus} : {}) }
  const [rows,total]=await Promise.all([prisma.study.findMany({where,orderBy:{updatedAt:'desc'},skip:(page-1)*limit,take:limit}),prisma.study.count({where})])
  res.json({data:rows.map(s=>({...s,status:s.status.replace('_',' ')})),total,page,limit,totalPages:Math.ceil(total/limit)})
} catch(e){next(e)} })
app.get('/api/studies/:id',async(req,res,next)=>{try{const s=await prisma.study.findUnique({where:{id:req.params.id},include:{participants:true,milestones:true}});if(!s)return res.status(404).json({message:'Study not found'});res.json({...s,status:s.status.replace('_',' ')})}catch(e){next(e)}})
app.post('/api/studies',requireAuth,allowRoles(UserRole.ADMIN,UserRole.STUDY_COORDINATOR),async(req,res,next)=>{try{const input=studyInput.parse(req.body);const s=await prisma.study.create({data:{...input,status:input.status.replace(' ','_') as StudyStatus,startDate:new Date(input.startDate)}});res.status(201).json({...s,status:s.status.replace('_',' ')})}catch(e){next(e)}})
app.patch('/api/studies/:id',requireAuth,allowRoles(UserRole.ADMIN,UserRole.STUDY_COORDINATOR),async(req,res,next)=>{try{const input=studyInput.partial().parse(req.body);const data:any={...input};if(input.startDate)data.startDate=new Date(input.startDate);if(input.status)data.status=input.status.replace(' ','_');const s=await prisma.study.update({where:{id:req.params.id},data});res.json({...s,status:s.status.replace('_',' ')})}catch(e){next(e)}})
app.delete('/api/studies/:id',requireAuth,allowRoles(UserRole.ADMIN),async(req,res,next)=>{try{await prisma.study.delete({where:{id:req.params.id}});res.status(204).end()}catch(e){next(e)}})

const siteInput=z.object({name:z.string().min(2),city:z.string().min(2),country:z.string().min(2),status:z.string().default('Active'),studyCount:z.number().int().nonnegative().default(0)})
app.get('/api/sites',async(_req,res,next)=>{try{res.json(await prisma.site.findMany({orderBy:{name:'asc'}}))}catch(e){next(e)}})
app.post('/api/sites',requireAuth,allowRoles(UserRole.ADMIN,UserRole.STUDY_COORDINATOR),async(req,res,next)=>{try{res.status(201).json(await prisma.site.create({data:siteInput.parse(req.body)}))}catch(e){next(e)}})
app.patch('/api/sites/:id',requireAuth,allowRoles(UserRole.ADMIN,UserRole.STUDY_COORDINATOR),async(req,res,next)=>{try{res.json(await prisma.site.update({where:{id:req.params.id},data:siteInput.partial().parse(req.body)}))}catch(e){next(e)}})
app.delete('/api/sites/:id',requireAuth,allowRoles(UserRole.ADMIN),async(req,res,next)=>{try{await prisma.site.delete({where:{id:req.params.id}});res.status(204).end()}catch(e){next(e)}})

app.get('/api/participants',async(req,res,next)=>{try{const {page,limit}=pageParams(req);const q=String(req.query.q||'');const where:Prisma.ParticipantWhereInput=q?{OR:[{participantCode:{contains:q,mode:'insensitive'}},{siteName:{contains:q,mode:'insensitive'}},{study:{title:{contains:q,mode:'insensitive'}}}]}:{};const [rows,total]=await Promise.all([prisma.participant.findMany({where,include:{study:true},orderBy:{enrolledAt:'desc'},skip:(page-1)*limit,take:limit}),prisma.participant.count({where})]);res.json({data:rows.map(p=>({id:p.id,participantCode:p.participantCode,studyTitle:p.study.title,siteName:p.siteName,status:p.status,enrolledAt:p.enrolledAt})),total,page,limit,totalPages:Math.ceil(total/limit)})}catch(e){next(e)}})
const participantInput=z.object({participantCode:z.string().min(3),studyId:z.string().min(1),siteName:z.string().min(2),status:z.nativeEnum(ParticipantStatus).default(ParticipantStatus.Screening),enrolledAt:z.string().datetime()})
app.post('/api/participants',requireAuth,allowRoles(UserRole.ADMIN,UserRole.STUDY_COORDINATOR,UserRole.INVESTIGATOR),async(req,res,next)=>{try{const input=participantInput.parse(req.body);res.status(201).json(await prisma.participant.create({data:{...input,enrolledAt:new Date(input.enrolledAt)}}))}catch(e){next(e)}})
app.patch('/api/participants/:id',requireAuth,allowRoles(UserRole.ADMIN,UserRole.STUDY_COORDINATOR,UserRole.INVESTIGATOR),async(req,res,next)=>{try{const input=participantInput.partial().parse(req.body);const data:any={...input};if(input.enrolledAt)data.enrolledAt=new Date(input.enrolledAt);res.json(await prisma.participant.update({where:{id:req.params.id},data}))}catch(e){next(e)}})
app.delete('/api/participants/:id',requireAuth,allowRoles(UserRole.ADMIN,UserRole.STUDY_COORDINATOR),async(req,res,next)=>{try{await prisma.participant.delete({where:{id:req.params.id}});res.status(204).end()}catch(e){next(e)}})

app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{if(err instanceof z.ZodError)return res.status(400).json({message:'Validation failed',errors:err.flatten()});if(err instanceof Prisma.PrismaClientKnownRequestError){if(err.code==='P2002')return res.status(409).json({message:'A record with this unique value already exists'});if(err.code==='P2025')return res.status(404).json({message:'Record not found'});if(err.code==='P2003')return res.status(409).json({message:'This record is linked to other records and cannot be deleted'})}console.error(err);res.status(500).json({message:'Internal server error'})})
export default app
