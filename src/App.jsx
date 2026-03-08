import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard.jsx'
import AdminSidebar from './components/AdminSidebar.jsx'
import Candidates from './pages/Candidates.jsx'
import Counting from './pages/Counting.jsx'
import VotingStatus from './pages/VotingStatus.jsx'
import AdminFaceSettings from './pages/AdminFaceSettings.jsx'
function App() {
  

  return (
    <BrowserRouter>
      <Routes>
      <Route path='/' element={<Login/>}/>
     <Route path='/d'element={<Dashboard/>}/> 
     <Route path='/c'element={<Candidates/>}/>
     <Route path='/u'element={<Counting/>}/>
     <Route path='/s'element={<VotingStatus/>}/>
     <Route path='/f'element={<AdminFaceSettings/>}/>
         </Routes>
    </BrowserRouter>
     
    
  )
}

export default App
