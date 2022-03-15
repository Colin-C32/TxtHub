import React, { useState, useMemo } from 'react';
import {Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/account/LoginPage';
import SignupPage from './pages/account/SignupPage';
import PResetPage from './pages/account/PResetPage';
import Wordle from './components/wordle/Wordle';
import Anagrams from './components/anagrams/Anagrams';
import ScoreBoard from './pages/ScoreBoard';
import { UserContext } from './UserContext';
import TBA from './components/TBA/TBA'

function App() {

  const [user, setUser] = useState(null);
  const providerValue = useMemo( ()=> ({user, setUser}), [user, setUser]);
  return (
    
    <div>
      
      <UserContext.Provider value = {providerValue}>
        <Routes>

          <Route path='/' element={<HomePage/>}/>

          <Route path='/scoreboard' element={<ScoreBoard/>}/>
          
          <Route path='/login' element={<LoginPage/>}/>

          <Route path='/signup' element={<SignupPage/>}/>

          <Route path='/password-reset' element={<PResetPage/>}/>

          <Route path='/profile' element={<ProfilePage/>}/>

          <Route path='/wordle' element={<Wordle/>}/>

          <Route path='/anagrams' element={<Anagrams/>}/>

          <Route path='/tba' element={<TBA/>}/>

        </Routes>
      </UserContext.Provider>
    </div>
  );
}

export default App;
