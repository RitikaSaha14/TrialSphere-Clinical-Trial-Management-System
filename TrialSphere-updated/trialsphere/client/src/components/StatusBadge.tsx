export default function StatusBadge({status}:{status:string}) {
 const cls = status.toLowerCase().replaceAll(' ','-')
 return <span className={`status-pill status-${cls}`}>{status}</span>
}
