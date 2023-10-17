import React from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { AuthContext } from "../contexts/AuthContext";
import {useParams, useNavigate} from 'react-router-dom'

import { Message } from "./Message";
import {API_URL} from './Constants'


export default function Chat() {
  const {conversationName} = useParams();
  const {user} = React.useContext(AuthContext)
  const navigate = useNavigate();
  const [welcomeMessage, setWelcomeMessage] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [name, setName] = React.useState(user.username);
  const [messageHistory, setMessageHistory] = React.useState([])
  let from_user
  for (let name of conversationName.split('__')) {
            if(name!==user.username) {
                from_user = name
            }
      }

  const { readyState, sendJsonMessage } = useWebSocket(user ? `${API_URL}/${conversationName}/` : null, {
    queryParams: {
      token: user ? user.token : "",
    },
    onOpen: () => {
      console.log("Connected!");
    },
    onClose: () => {
      console.log("Disconnected!");
    },
    onMessage: (e) => {
      const data = JSON.parse(e.data);
      // console.log(data)
      switch (data.type) {
        case "welcome_message":
          setWelcomeMessage(data.message);
          break;
        case 'chat_message_echo':
          setMessageHistory((prev) => ([data.message ,...prev ]));
          break;
        case "last_50_messages":
          setMessageHistory(data.messages);
          break;
        default:
          console.error("Unknown message type!");
          break;
      }
    }
  });

  function handleChangeMessage(e) {
    setMessage(e.target.value);
  }
   
  // function handleChangeName(e) {
  //   setName(e.target.value);
  // }

  function handleSubmit() {
    sendJsonMessage({
      type: "chat_message",
      message,
      name
    });
    // setName("");
    setMessage("");
  }
  const dates = new Set();
  const renderDate = (message, dateNum) => {
      dates.add(dateNum)
      const [year, month, day] = dateNum.split('-')
      const date = day + '-' + month + '-' + year
      return(
        <div className="rounded  text-xs text-gray-800 bg-yellow-50 w-max mx-[auto] my-4 px-2">
            {date}
        </div>
      )
  }
  // console.log(new Date())
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated"
  }[readyState];
 
  return (
    <div >
      <div className="w-[100vw] sm:w-[70vw] min-h-screen  mt-3  ">
        <div className="sticky z-40 top-2 flex items-center bg-lime-100 rounded w-max pr-12">
          <button onClick = {() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} 
              stroke="currentColor" className="w-4 h-6 text-xl text-black">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="m-1 mr-2 w-10 h-10 relative flex justify-center items-center rounded-full bg-gray-900 text-2xl font-semibold text-white uppercase">{from_user.slice(0,1)}</div>
          <h3 className="text-xl text-gray-800">{from_user}</h3>
        </div>
        <div>
          <ul className="mt-3 flex flex-col relative overflow-y-auto p-1">
            {messageHistory.map((message) => {
                let dateNum = message.timestamp 
                const index = dateNum.indexOf(' ')
                dateNum = dateNum.slice(0, index)
                return (
                  <React.Fragment key={message.id}>
                    {dates.has(dateNum) ? null : renderDate(message, dateNum)}
                    <Message  message={message} />
                  </React.Fragment>
                )
            }
            )}
          </ul>
        </div>

        <div className="fixed z-40 bottom-1 flex justify-end ">
          {/* <p>{welcomeMessage}</p>
          <button
            onClick={() => {
              sendJsonMessage({
                type: "greeting",
                message: "Hi!"
              });
            }}
          >
            Say Hi
          </button> */}
          {/* <input
            name="name"
            placeholder='Name'
            onChange={handleChangeName}
            value={name}
          /> */}
          <input
            name="message"
            placeholder='Message'
            onChange={handleChangeMessage}
            value={message}
            className="ml-20 w-[50vw] h-10 shadow-sm sm:text-sm border-gray-300 bg-gray-100 rounded-md"
          />
          <button  
            onClick={handleSubmit}
            className='ml-3 bg-gray-300 px-3 py-1 rounded-full'  
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
              stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>

          </button>          

        </div>
      </div>
    </div>
  );
}


