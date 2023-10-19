import React from 'react';
import {NavLink, Link, Outlet} from 'react-router-dom';

import {AuthContext} from '../contexts/AuthContext'

export default function Navbar() {
    const { user, logout } = React.useContext(AuthContext);
    const [menu, setMenu] = React.useState(false)
    return (
        <div className='min-h-screen'>
            <nav className='shadow-sm shadow-zinc-50'>
            
                <div className="  h-12 w-screen px-8 flex flex-wrap justify-between items-center">
                    { user &&
                    <div className='flex text-zinc-50'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                             strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3>
                            {user.username}
                        </h3>
                    </div>
                    }
                    <Link to="/" className="flex items-center ">
                        <span className="tracking-wider font-mono self-center text-2xl text-zinc-50 font-semibold whitespace-nowrap dark:text-white">
                            FUN CHAT
                        </span>
                    </Link>
                    {/* // for big screen */}
                    <ul className='text-zinc-50 text-xl  hidden sm:flex justify-between  '>
                        <li>
                            <NavLink 
                                to='/'
                                style={({ isActive, isPending }) => {
                                    return {
                                      fontWeight: isActive ? "550" : "",
                                      color: isActive ? "#aaccf0" : "",
                                    };
                                  }}    
                            >
                                Chats
                            </NavLink>
                        </li>
                        {
                        !user ? (
                            <li className='ml-8'>
                            <NavLink 
                                to="/login"
                                style={({ isActive, isPending }) => {
                                    return {
                                      fontWeight: isActive ? "550" : "",
                                      color: isActive? "#aaccf0" : "",
                                    };
                                  }}    
                            >
                                Login
                            </NavLink>
                            </li>
                        ) : (
                            <>
                            {/* <span >Logged in: {user.username}</span> */}
                            <li className='ml-8'>
                                <NavLink
                                    to="/friends"
                                    aria-current="page"
                                    style={({ isActive, isPending }) => {
                                        return {
                                          fontWeight: isActive ? "550" : "",
                                          color: isActive? "#aaccf0" : "",
                                        };
                                      }}   
                                >
                                    Friends
                                </NavLink>
                             </li>
                            <button className='ml-8' onClick={logout}>
                                Logout
                            </button>
                            </>
                        )
                        }
                    </ul>
                    {/* for mobile screen */}
                    <div className='block sm:hidden'>
                        <button onClick={() => setMenu(!menu)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                                strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-4 text-2xl text-zinc-50">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <div className={`${menu ? 'block' : 'hidden'} absolute right-4 rounded p-px w-52 py-2 opacity-100 bg-white text-gray-900 flex justify-between items-start`}>
                            <button onClick={() => setMenu(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                                    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <ul className='mr-3 '>
                                <li>
                                    <Link to='/'
                                        className=''
                                    >
                                        Chat
                                    </Link>
                                </li>
                                { !user ? (
                                <li >
                                    <Link 
                                        to="/login"    
                                    >
                                        Login
                                    </Link>
                                </li>
                                ) : (
                                <>
                            {/* <span >Logged in: {user.username}</span> */}
                                <li>
                                    <Link
                                        to="/friends"
                                        aria-current="page"
                                    >
                                        Friends
                                    </Link>
                                </li>
                                <button  onClick={logout}>
                                    Logout
                                </button>
                                </>
                                )
                            }
                            </ul>
                        </div>
                    </div>
                </div>
                
            </nav>
            <div className='flex flex-col  justify-center items-center'>
                <Outlet />
            </div>
        </div>
    )
}