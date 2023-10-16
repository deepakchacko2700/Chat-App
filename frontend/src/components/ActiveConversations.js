import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
 
import { AuthContext } from "../contexts/AuthContext";
import {API_URL} from './Constants'


export function ActiveConversations() {
  const { user } = useContext(AuthContext);
  const [conversations, setActiveConversations] = useState([]);
 
  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch(`${API_URL}/api/conversations/`, {
        headers: {
          Authorization: `Token ${user?.token}`
        }
      });
      const data = await res.json();
      setActiveConversations(data);
    }
    user && fetchUsers();
  }, [user]);
 
  function createConversationName(username) {
    const namesAlph = [user?.username, username].sort();
    return `${namesAlph[0]}__${namesAlph[1]}`;
  }
 
  function formatMessageTimestamp(timestamp) {
    if (!timestamp) return;
    // console.log(timestamp, typeof(timestamp))
    const date = new Date(timestamp);
    const today = new Date();
    if (date.getDate() !== today.getDate()) {
      const index = timestamp.indexOf(' ')
      const dateNum = timestamp.slice(0, index)
      const [year, month, day] = dateNum.split('-')
      const date = day + '-' + month + '-' + year
      return  date
    }
    else {
    var time =  date.toLocaleTimeString();
    time = time.slice(0,-6) + ' ' + time.slice(-2)
    return time
    }
  }
 
  return (
    <div className=" mt-10 flex flex-col items-start rounded  ">
      {user && conversations.map((c) => (
        <Link
          to={`/chats/${createConversationName(c.other_user.username)}`}
          key={c.other_user.username}
        >
          <div className=" w-[90vw] sm:w-[50vw] transition-transform hover:scale-105 from-gray-500 shadow-md rounded-md pr-1 mb-3">
            <div className="flex  items-start ">
              {/* <svg 
                xmlns="http://www.w3.org/2000/svg" fill="none" 
                viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg> */}
              <div className="m-1 mr-2 w-10 h-10 relative flex justify-center items-center rounded-full bg-yellow-100 text-2xl font-semibold text-black uppercase">{c.other_user.username.slice(0,1)}</div>
              <div >
                <h3 className="ml-2 text-xl font-semibold font-sans text-white">{c.other_user.username}</h3>
                <p className="ml-4 text-sm text-white">{c.last_message?.content}</p>
              </div>
              <p className="ml-[auto] text-sm text-white pt-2">{formatMessageTimestamp(c.last_message?.timestamp)}</p>
            </div>
            
          </div>
        </Link>
      ))}
      <div>
        { !conversations[0] &&
          <h4 className="text-white pr-8 ">To start new conversations,&nbsp;
            <Link to='friends' className="text-yellow-100 ">
              <h4 className="animate-bounce">
                find your freinds
              </h4>
            </Link>
            </h4>
        }
      </div>
    </div>
  );
}