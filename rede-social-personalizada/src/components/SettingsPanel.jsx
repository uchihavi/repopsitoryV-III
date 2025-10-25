export default function SettingsPanel(){
return (
<div className="card">
<h3>Configurações</h3>
<label style={{display:'block', marginTop:8}}>
<input type="checkbox" /> Receber e-mails de novidade
</label>
<label style={{display:'block', marginTop:8}}>
<input type="checkbox" defaultChecked /> Modo compacto
</label>
</div>
)
}