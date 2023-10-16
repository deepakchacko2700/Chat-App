import React from 'react';
import { Link } from "react-router-dom";
 
import { AuthContext } from "../contexts/AuthContext";
import {API_URL} from './Constants'


export function Conversations() {
    const { user } = React.useContext(AuthContext);
    const [users, setUsers] = React.useState([]);
    // console.log(users)
    React.useEffect(() => {
        async function fetchUsers() {
          const res = await fetch(`${API_URL}/api/user-viewset/`, {
            headers: {
              Authorization: `Token ${user?.token}`
            }
          });
          const data = await res.json();
          setUsers(data);
        }
        fetchUsers();
      }, [user]);

      function createConversationName(username) {
        const namesAlph = [user?.username, username].sort();
        return `${namesAlph[0]}__${namesAlph[1]}`;
      }

      return (
        <div className='text-white text-xl pt-10'>
          {users
            .filter((u) => u.username !== user?.username)
            .map((u) => (
              <Link to={`/chats/${createConversationName(u.username)}`}
                  key={u.username}
              >
              <div  className='flex items-center mb-2'>
                <div className="m-1 mr-2  w-10 h-10 relative flex justify-center items-center rounded-full bg-yellow-100 text-2xl font-semibold text-black uppercase">{u.username.slice(0,1)}</div>
                <div >{u.username}</div>
              </div>
              </Link>
            ))}
        </div>
      );
}