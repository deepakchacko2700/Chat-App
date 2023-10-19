import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { AuthContext } from "../contexts/AuthContext";
import {API_URL} from './Constants'


export function ActiveConversations() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  
  const { readyState } = useWebSocket(user ? `wss://fun-chat-2s6u.onrender.com/notifications/` : null, {
    queryParams: {
      token: user ? user.token : ""
    },
    onOpen: () => {
      console.log("Connected to Notifications!");
    },
    onClose: () => {
      console.log("Disconnected from Notifications!");
    },
    onMessage: (e) => {
      const data = JSON.parse(e.data);
      // console.log(data)
      switch (data.type) {
        case 'unread_count':
          // console.log(data.active_conversations)
          setConversations(data.active_conversations)
          break;
        case "new_message_notification" :
          // console.log(data.name, data.message)
          setConversations(() => handleNewConversation(data))
          break;
        default:
          console.error("Unknown message type!");
          break;
      }
    }
  });
 
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated"
  }[readyState];
 
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
  };

  function handleNewConversation(data) {
     let new_conversation_list =  conversations.map(c => {
          if (c.other_user.username === data.name) {
              let unread_count = c.unread_msg_count
            return({...c, last_message: data.message, unread_msg_count: unread_count+1})
          }
          else {
            return c
          }
     })
    //  console.log(new_conversation_list)
    //  temporary array holds objects with position and sort-value
    const  mapped = new_conversation_list.map((c, i) => {
        return ({i, timestamp: c.last_message.timestamp})
    });
    // sorting the mapped array in descending order containing the reduced values
    mapped.sort((a, b) => {
      if (Date.parse(a.timestamp) > Date.parse(b.timestamp)) {
        return -1
      }
      else {
        return 1
      }
    });
    // traverse the temporary array to achieve the right order.
    new_conversation_list = mapped.map(c => new_conversation_list[c.i]) 
    
    return new_conversation_list
  }
 
  return (
    <div className=" mt-10 flex flex-col items-start rounded  ">
      {conversations[0] && conversations.map((c) => (
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
              <div className="ml-[auto]">
                <p className=" text-sm text-white pt-2">{formatMessageTimestamp(c.last_message?.timestamp)}</p>
                { c.unread_msg_count != 0
                    ? <div className="m-1 mr-2 ml-[auto] w-4 h-4 relative flex justify-center items-center rounded-full bg-lime-200 text-sm font-semibold text-gray-700 ">{c.unread_msg_count}</div>
                    : null
                  }
              </div>
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