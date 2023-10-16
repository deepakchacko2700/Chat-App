import React from "react";
import { BrowserRouter,HashRouter, Routes, Route } from "react-router-dom";
 
import Chat from './components/Chat'
import Login from './components/Login'
import Navbar from "./components/Navbar";
import { ActiveConversations } from "./components/ActiveConversations";
import { Conversations } from "./components/Conversations";
import AuthContextProvider from './contexts/AuthContext'
import { ProtectedRoute } from "./components/ProtectedRoute";


export default function App() {
  return (
      <HashRouter>
          <Routes>
            <Route path="/" 
              element={
                <AuthContextProvider>
                  <Navbar />
                </AuthContextProvider>
              }
            >
              <Route
                    path=""
                    element={
                      <ProtectedRoute>
                        <ActiveConversations />
                      </ProtectedRoute>
                    }
                  />
              <Route path="friends"
                 element={
                  <ProtectedRoute>
                    <Conversations />
                  </ProtectedRoute>
                }
              />
              <Route path="chats/:conversationName"
                 element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                 }
              />
              <Route path="login" element={<Login />} />
          </Route>
          </Routes>
      </HashRouter>
  );
}


