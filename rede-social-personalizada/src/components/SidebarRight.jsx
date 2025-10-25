import SuggestedProfiles from './SuggestedProfiles'
import ChatWidget from './ChatWidget'
import NotificationsPanel from './NotificationsPanel'
import SettingsPanel from './SettingsPanel'


export default function SidebarRight({ panel }){
// Comportamento: exibe notificações ou configurações quando solicitado; caso contrário, mostra sugestões + chat
if(panel === 'notifications'){
return (
<aside className="rightbar">
<NotificationsPanel />
</aside>
)
}
if(panel === 'settings'){
return (
<aside className="rightbar">
<SettingsPanel />
</aside>
)
}
return (
<aside className="rightbar">
<SuggestedProfiles />
<ChatWidget />
</aside>
)
}