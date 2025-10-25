import Post from './Post'


export default function PostFeed({ posts }){
if(!posts?.length) return <div className="card">Nenhum post ainda.</div>
return (
<div>
{posts.map(p => <Post key={p.id} post={p} />)}
</div>
)
}