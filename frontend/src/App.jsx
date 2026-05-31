import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ChatPage from './pages/ChatPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard/:analysisId" element={<DashboardPage />} />
      <Route path="/chat/:analysisId" element={<ChatPage />} />
    </Routes>
  );
}

export default App;
