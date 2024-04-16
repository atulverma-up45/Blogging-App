import { Link } from "react-router-dom";
const UserCard = ({user})=>{
    const {personal_info: {firstName, lastName, username, avatar }} = user;
return (
   <Link to={`/user/${username}`} className="flex gap-5 items-center mb-5">
    <img src={avatar} alt={firstName} className="w-14 h-14 rounded-full" />
<div>
    <h1 className="font-medium text-xl line-clamp-2">{firstName + " " + lastName}</h1>
    <p className="text-darl-grey"> @{username}</p>

</div>
   </Link>
)
}

export default UserCard