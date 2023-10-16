import { useContext } from "react";
 
import { AuthContext } from "../contexts/AuthContext";
 
 
export function Message({ message }) {
  const { user } = useContext(AuthContext);

  function formatMessageTimestamp(timestamp) {
    if (!timestamp) return;
    const date = new Date(timestamp);
    var time =  date.toLocaleTimeString();
    time = time.slice(0,-6) + ' ' + time.slice(-2)
    return time
  }

  return (
    <li
      className={`my-2 flex 
        ${user.username === message.to_user.username ? "justify-start" : "justify-end"}`
      }
    >
      <div
        className={`relative max-w-xl rounded-lg px-2 py-1  shadow
          ${user.username === message.to_user.username ? "text-white bg-gray-400" : "text-gray-800 bg-gray-100"}`
        }
      >
        <div className="flex items-end">
          <span className="block">{message.content}</span>
          <span
            className="ml-2"
            style={{
              fontSize: "0.6rem",
              lineHeight: "1rem"
            }}
          >
            {formatMessageTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    </li>
  );
}