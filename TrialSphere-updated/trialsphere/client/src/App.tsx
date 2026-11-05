import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { Activity, Bell, ChevronDown, ClipboardList, FlaskConical, LayoutDashboard, MapPin, Menu, Search, Settings, Users, UserRound, FileBarChart, CircleHelp } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Studies from './pages/Studies'
import Sites from './pages/Sites'
import Participants from './pages/Participants'
import './app.css'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import { api } from './api'

const nav = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Clinical studies', to: '/studies', icon: FlaskConical },
  { label: 'Trial sites', to: '/sites', icon: MapPin },
  { label: 'Participants', to: '/participants', icon: Users },
]
type SessionUser = { id:string; name:string; email:string; role:string }
function Shell({ user, onLogout }: { user:SessionUser; onLogout:()=>void }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={21}/></div><span>Trial<span className="brand-light">Sphere</span></span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(({label,to,icon:Icon}) => <NavLink key={to} to={to} className={({isActive}) => `nav-link ${isActive?'active':''}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="workspace-label lower-label">MANAGE</div>
      <div className="nav-link muted"><UserRound size={18}/><span>Investigators</span><span className="soon">Soon</span></div>
      <div className="nav-link muted"><ClipboardList size={18}/><span>Milestones & tasks</span><span className="soon">Soon</span></div>
      <div className="nav-link muted"><FileBarChart size={18}/><span>Reports</span><span className="soon">Soon</span></div>
      <div className="sidebar-bottom"><div className="nav-link muted"><Settings size={18}/><span>Settings</span></div><div className="help-card"><CircleHelp size={18}/><div><b>Need help?</b><small>View project documentation</small></div></div><button className="profile profile-button" onClick={onLogout}><div className="avatar">{user.name.split(' ').map(v=>v[0]).join('').slice(0,2).toUpperCase()}</div><div><b>{user.name}</b><small>{user.role.replaceAll('_',' ').toLowerCase()} · Sign out</small></div><ChevronDown size={16}/></button></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="mobile-brand"><Menu size={20}/> TrialSphere</div><div className="breadcrumb">Workspace <span>/</span> <b>Clinical operations</b></div><div className="top-actions"><button className="icon-btn" aria-label="Search"><Search size={18}/></button><button className="icon-btn" aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">AD</div></div></header><Routes><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/studies" element={<Studies/>}/><Route path="/sites" element={<Sites/>}/><Route path="/participants" element={<Participants/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes><footer>TrialSphere <span>•</span> Portfolio demonstration using fictional data</footer></main>
  </div>
}
export default function App(){ const [user,setUser]=useState<SessionUser|null>(null); const [checking,setChecking]=useState(true); useEffect(()=>{api.get('/auth/me').then(r=>setUser(r.data.user)).catch(()=>setUser(null)).finally(()=>setChecking(false))},[]); if(checking)return <div className="auth-loading">Loading TrialSphere…</div>; if(!user)return <Login onLogin={setUser}/>; return <Shell user={user} onLogout={async()=>{await api.post('/auth/logout');setUser(null)}}/> }
