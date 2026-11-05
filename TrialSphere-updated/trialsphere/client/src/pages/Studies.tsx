import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, FlaskConical } from 'lucide-react'
import { getStudies } from '../api'
import type { Study } from '../types'
import StatusBadge from '../components/StatusBadge'
const demo:Study[]=[
{id:'1',protocolCode:'TS-ONC-024',title:'Oncology Outcomes Study',phase:'Phase III',status:'Recruiting',targetEnrollment:300,currentEnrollment:218,startDate:'2026-01-15'},
{id:'2',protocolCode:'TS-CARD-018',title:'Cardiovascular Safety Trial',phase:'Phase II',status:'Active',targetEnrollment:180,currentEnrollment:156,startDate:'2026-02-10'},
{id:'3',protocolCode:'TS-NEU-011',title:'Neurology Research Program',phase:'Phase II',status:'Planning',targetEnrollment:120,currentEnrollment:0,startDate:'2026-08-01'},
{id:'4',protocolCode:'TS-IMM-032',title:'Immunology Efficacy Study',phase:'Phase III',status:'Recruiting',targetEnrollment:250,currentEnrollment:194,startDate:'2026-03-12'},
{id:'5',protocolCode:'TS-RESP-007',title:'Respiratory Health Study',phase:'Phase IV',status:'Active',targetEnrollment:200,currentEnrollment:172,startDate:'2026-01-28'},
{id:'6',protocolCode:'TS-DERM-015',title:'Dermatology Observational Study',phase:'Phase IV',status:'Completed',targetEnrollment:150,currentEnrollment:150,startDate:'2025-06-01'}
]
export default function Studies(){
 const [q,setQ]=useState('');const [status,setStatus]=useState('All')
 const query=useQuery<Study[]>({queryKey:['studies',q,status],queryFn:async()=>{const d=await getStudies(q,status);return d.data??d},retry:0})
 const rows=useMemo(()=>{const source=query.data??(query.isError?demo:demo);return source.filter(s=>(s.title.toLowerCase().includes(q.toLowerCase())||s.protocolCode.toLowerCase().includes(q.toLowerCase()))&&(status==='All'||s.status===status))},[query.data,q,status])
 return <section className="page"><div className="page-heading"><div><div className="eyebrow">WORKSPACE / STUDIES</div><h1>Clinical studies</h1><p>Manage research programs, protocols and enrollment progress.</p></div><button className="primary-btn"><Plus size={15}/> New study</button></div>
 <div className="toolbar"><div className="search-box"><Search size={15}/><input placeholder="Search studies or protocol..." value={q} onChange={e=>setQ(e.target.value)}/></div><select className="filter-select" value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Recruiting</option><option>Active</option><option>Planning</option><option>Completed</option><option>On Hold</option></select></div>
 <div className="panel table-panel"><div className="panel-head"><div><h2>All studies <span style={{color:'#9aa4b6',fontWeight:500}}>({rows.length})</span></h2><p>Study portfolio and current enrollment status</p></div></div><div className="table-wrap"><table><thead><tr><th>Study / Protocol</th><th>Phase</th><th>Status</th><th>Enrollment progress</th><th>Start date</th></tr></thead><tbody>{rows.map(s=><tr key={s.id}><td><span className="study-name">{s.title}</span><span className="subtext">{s.protocolCode}</span></td><td>{s.phase}</td><td><StatusBadge status={s.status}/></td><td><div className="table-progress"><div className="progress"><span style={{width:`${Math.min(100,s.currentEnrollment/s.targetEnrollment*100)}%`,background:'#315efb'}}/></div><small>{s.currentEnrollment}/{s.targetEnrollment}</small></div></td><td>{new Date(s.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td></tr>)}</tbody></table>{rows.length===0&&<div className="empty-state"><FlaskConical size={25}/><p>No studies match your search.</p></div>}</div></div></section>
}
