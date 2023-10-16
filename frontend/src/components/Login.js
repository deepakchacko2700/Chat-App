import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
 
import { AuthContext } from "../contexts/AuthContext";


export default function Login() {
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    // console.log(username, password)

    useEffect(() => {
        if (user) {
            navigate("/");
        }
        }, [user, navigate]);

    const handleSubmit = async(e) => {
        e.preventDefault()
        console.log('submitted')
        try {
            const data = await login(username, password)
            navigate('/')
        }
        catch(err) {
            console.error(err)
        }          
    }
    return(
        <div className=" w-96  bg-gray-500 my-24 rounded ">
            <h1 className="text-zinc-50 text-center font-semibold my-2">Login</h1>
            <form >
            <div className="flex flex-col">

                <input
                    name='username'
                    value={username}
                    type='text'
                    label='username'
                    placeholder="username"
                    onChange={(e) => setUsername(e.target.value)}
                    className="mb-3 rounded-sm mx-2"
                />
                <input
                    name='password'
                    value={password}
                    type='password'
                    placeholder="password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-3 rounded-sm mx-2"
                />
                { error &&
                    <h4 className="text-center text-red-500">{error}</h4>
                }

                <button 
                    onClick={handleSubmit}
                    className="text-zinc-50 bg-black w-fit m-[auto] px-1 rounded-sm"
                >
                    Submit
                </button>
            </div>
            </form>
        </div>
    )
}