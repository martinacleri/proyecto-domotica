import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ControlPanel from './ControlPanel';
import Register from './Register';
import Login from './Login';
import ClassroomList from './Classrooms';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/control-panel" element={<ControlPanel />} />
      <Route path="/classrooms" element={<ClassroomList />} />
    </Routes>
  );
}

export default App;
