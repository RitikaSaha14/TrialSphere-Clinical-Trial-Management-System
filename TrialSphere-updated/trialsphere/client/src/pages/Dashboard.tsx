import { useQuery } from '@tanstack/react-query'
import { Activity, Building2, Users, Target, ArrowUpRight, CalendarDays } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { getStats, getStudies } from '../api'
import StatusBadge from '../components/StatusBadge'
import type { DashboardStats, Study } from '../types'

const fallback: DashboardStats = {
 activeStudies: 18, activeSites: 42, enrolledParticipants: 1248, enrollmentTarget: 1800,
 trend:[{month:'Jan',enrolled:120,target:145},{month:'Feb',enrolled:185,target:190},{month:'Mar',enrolled:260,target:245},{month:'Apr',enrolled:335,target:310},{month:'May',enrolled:430,target:390},{month:'Jun',enrolled:510,target:475}],
 statusBreakdown:[{name:'Recruiting',value:8},{name:'Active',value:5},{name:'Planning',value:3},{name:'Completed',value:2}]
}
const colors=['#315efb','#24b78a','#f2ad55','#aab3c3']
export default function Dashboard(){
 const statsQ=useQuery<DashboardStats>({queryKey:['stats'],queryFn:getStats,retry:0})
 const studiesQ=useQuery<Study[]>({queryKey:['studies','recent'],queryFn:async()=>{const d=await getStudies();return d.data??d},retry:0})
 const stats=statsQ.data??fallback
 const studies=(studiesQ.data??[]).slice(0,5)
 const cards=[
  {label:'Active studies',value:stats.activeStudies,foot:'+2 this quarter',icon:Activity,bg:'#eef2ff',color:'#315efb'},
  {label:'Active trial sites',value:stats.activeSites,foot:'+4 new sites onboarded',icon:Building2,bg:'#e9f8f2',color:'#19a477'},
  {label:'Participants enrolled',value:stats.enrolledParticipants.toLocaleString(),foot:'Across all active studies',icon:Users,bg:'#fff4e8',color:'#d8953e'},
  {label:'Enrollment target',value:`${Math.round(stats.enrolledParticipants/stats.enrollmentTarget*100)}%`,foot:`${stats.enrollmentTarget.toLocaleString()} planned participants`,icon:Target,bg:'#f5efff',color:'#8a62d5'}
 ]
 return <section className="page">
  <div className="page-heading"><div><div className="eyebrow">CLINICAL OPERATIONS / OVERVIEW</div><h1>Good morning, Alex <span>✦</span></h1><p>Here's what's happening across your clinical research portfolio.</p></div><div className="date-chip"><CalendarDays size={14}/> November 5, 2026</div></div>
  <div className="stats-grid">{cards.map(c=><div className="stat-card" key={c.label}><div className="stat-top"><span>{c.label}</span><span className="stat-icon" style={{background:c.bg,color:c.color}}><c.icon size={16}/></span></div><div className="stat-value">{c.value}</div><div className="stat-foot"><span className="positive"><ArrowUpRight size={11} style={{display:'inline',verticalAlign:'middle'}}/> {c.foot}</span></div></div>)}</div>
  <div className="dashboard-grid">
   <div className="panel"><div className="panel-head"><div><h2>Participant enrollment</h2><p>Enrollment progress across the portfolio</p></div><div className="legend"><span><i className="dot" style={{background:'#315efb'}}/> Enrolled</span><span><i className="dot" style={{background:'#9fc5ff'}}/> Target</span></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={stats.trend}><defs><linearGradient id="enrolledFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#315efb" stopOpacity={.18}/><stop offset="100%" stopColor="#315efb" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#f0f2f7" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="target" stroke="#a8c5ff" strokeDasharray="4 4" fill="none" strokeWidth={2}/><Area type="monotone" dataKey="enrolled" stroke="#315efb" fill="url(#enrolledFill)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div></div>
   <div className="panel"><div className="panel-head"><div><h2>Study status</h2><p>Current study distribution</p></div></div><div style={{height:145}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.statusBreakdown} dataKey="value" nameKey="name" innerRadius={43} outerRadius={65} paddingAngle={4} stroke="none">{stats.statusBreakdown.map((_,i)=><Cell key={i} fill={colors[i%colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div><div className="status-list">{stats.statusBreakdown.map((s,i)=><div className="status-row" key={s.name}><span className="status-label"><i className="dot" style={{background:colors[i%colors.length],marginRight:7}}/>{s.name}</span><span className="status-count">{s.value}</span><div className="progress"><span style={{width:`${s.value/Math.max(...stats.statusBreakdown.map(x=>x.value))*100}%`,background:colors[i%colors.length]}}/></div></div>)}</div></div>
  </div>
  <div className="panel table-panel"><div className="panel-head"><div><h2>Recently updated studies</h2><p>Monitor progress across your active research programs</p></div><a href="/studies" style={{fontSize:10,color:'#315efb',textDecoration:'none',fontWeight:700}}>View all studies →</a></div><div className="table-wrap"><table><thead><tr><th>Study / Protocol</th><th>Phase</th><th>Status</th><th>Enrollment</th><th>Start date</th></tr></thead><tbody>{(studies.length?studies:demoStudies).map(s=><tr key={s.id}><td><span className="study-name">{s.title}</span><span className="subtext">{s.protocolCode}</span></td><td>{s.phase}</td><td><StatusBadge status={s.status}/></td><td><div className="table-progress"><div className="progress"><span style={{width:`${Math.min(100,s.currentEnrollment/s.targetEnrollment*100)}%`,background:'#315efb'}}/></div><small>{s.currentEnrollment}/{s.targetEnrollment}</small></div></td><td>{new Date(s.startDate).toLocaleDateString('en-US',{month:'short',year:'numeric'})}</td></tr>)}</tbody></table></div></div>
 </section>
}
const demoStudies:Study[]=[
{id:'1',protocolCode:'TS-ONC-024',title:'Oncology Outcomes Study',phase:'Phase III',status:'Recruiting',targetEnrollment:300,currentEnrollment:218,startDate:'2026-01-15'},
{id:'2',protocolCode:'TS-CARD-018',title:'Cardiovascular Safety Trial',phase:'Phase II',status:'Active',targetEnrollment:180,currentEnrollment:156,startDate:'2026-02-10'},
{id:'3',protocolCode:'TS-NEU-011',title:'Neurology Research Program',phase:'Phase II',status:'Planning',targetEnrollment:120,currentEnrollment:0,startDate:'2026-08-01'},
{id:'4',protocolCode:'TS-IMM-032',title:'Immunology Efficacy Study',phase:'Phase III',status:'Recruiting',targetEnrollment:250,currentEnrollment:194,startDate:'2026-03-12'},
{id:'5',protocolCode:'TS-RESP-007',title:'Respiratory Health Study',phase:'Phase IV',status:'Active',targetEnrollment:200,currentEnrollment:172,startDate:'2026-01-28'}
]
