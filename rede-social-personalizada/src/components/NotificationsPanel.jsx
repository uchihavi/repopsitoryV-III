export default function NotificationsPanel(){
const items = [
{ id:1, text:'João curtiu seu post.' },
{ id:2, text:'Maria comentou: "Top!"' }
]
return (
<div className="card">
<h3>Notificações</h3>
<ul>
{items.map(n => <li key={n.id} style={{padding:'6px 0', borderBottom:'1px solid #f1f5f9'}}>{n.text}</li>)}
</ul>
</div>
)
}