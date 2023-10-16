import React from 'react';
import {useNavigate} from 'react-router-dom';

// import AuthHeader from '../services/AuthHeader'
import {API_URL} from '../components/Constants'


export const AuthContext = React.createContext(null)

export default function AuthContextProvider({children}) {
    const navigate = useNavigate();
    const getUser = () => {
        const user = localStorage.getItem('user');
        return JSON.parse(user)
    };
    const [user, setUser] = React.useState(getUser);
    // console.log(user)
    const login = async(username, password) => {
        // console.log('login to api')
        try {
            const response = await fetch(`${API_URL}/auth-token/`,
            {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({username, password})
            }
            )
            // console.log(response)
            if(!response.ok) {
                // console.log(response.data)
                throw new Error(`Error! status: ${response.status}`)
            }
            else {
                const data = await response.json()
                localStorage.setItem('user', JSON.stringify(data))
                setUser(data)
                // console.log(data)
                return data
            }
        }
        catch (err) {
            console.error(err.message)
        }
    };

    const logout = () => {
        localStorage.removeItem('user')
        setUser(null)
        navigate('/login')
    };

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )

}