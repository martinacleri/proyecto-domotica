import React, { useState, useEffect } from 'react';
import './ControlPanel.css';

const ControlPanel = () => {
  const [mode, setMode] = useState('auto');
  const [lightsState, setLightsState] = useState(false);
  const [shuttersState, setShuttersState] = useState(false);
  const [openLightsTime, setOpenLightsTime] = useState("08:00");
  const [closeLightsTime, setCloseLightsTime] = useState("20:00");
  const [openShuttersTime, setOpenShuttersTime] = useState("08:00");
  const [closeShuttersTime, setCloseShuttersTime] = useState("20:00");

  const handleUpdateState = async () => {
    const classroomId = localStorage.getItem('selectedClassroomId');
    const userId = localStorage.getItem('userId');

    const data = {
      mode: mode,
      lights: lightsState,
      shutters: shuttersState,
      userId,
      classroomId,
      timestamp: new Date()
    };

    const response = await fetch(`http://localhost:3000/api/events/newEvent`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
      console.log(result.message);
    } else {
      console.error(result.error);
    }
  };

  useEffect(() => {
    if (mode === 'schedule') {
      const interval = setInterval(checkSchedule, 60000);
      return () => clearInterval(interval);
    }
  }, [mode, openLightsTime, closeLightsTime, openShuttersTime, closeShuttersTime]);

  const checkSchedule = () => {
    const currentTime = new Date();
    const currentHourMinute = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

    if (currentHourMinute === openLightsTime) controlLights('on');
    if (currentHourMinute === closeLightsTime) controlLights('off');
    if (currentHourMinute === openShuttersTime) controlShutters('open');
    if (currentHourMinute === closeShuttersTime) controlShutters('close');
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    fetch(`${process.env.REACT_APP_API_URL}/api/setMode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: newMode })
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error('Error:', error));
  };

  const controlLights = (state) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/manualControl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: state === 'on' ? 'encender' : 'apagar', device: 'luces' })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      setLightsState(state === 'on');
    })
    .catch(error => console.error('Error:', error));
  };
  
  const controlShutters = (state) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/manualControl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: state === 'open' ? 'abrir' : 'cerrar', device: 'persianas' })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      setShuttersState(state === 'open');
    })
    .catch(error => console.error('Error:', error));
  };

  const setLightsSchedule = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/schedule/lights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        openTime: openLightsTime,
        closeTime: closeLightsTime
      })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
    })
    .catch(error => console.error('Error:', error));
  };

  const setShuttersSchedule = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/schedule/shutters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        openTime: openShuttersTime,
        closeTime: closeShuttersTime
      })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <div className="container">
      {/* Barra de menú para seleccionar el modo */}
      <div className="menu-bar">
        <button 
          className={mode === 'auto' ? 'active' : ''} 
          onClick={() => changeMode('auto')}
        >
          Automático
        </button>
        <button 
          className={mode === 'manual' ? 'active' : ''} 
          onClick={() => changeMode('manual')}
        >
          Manual
        </button>
        <button 
          className={mode === 'schedule' ? 'active' : ''} 
          onClick={() => changeMode('schedule')}
        >
          Por Horario
        </button>
      </div>

      {/* Contenido mostrado según el modo seleccionado */}
      <div className="controls-section">
        {mode === 'manual' && (
          <div className="manual-controls">
            <h3>Control Manual</h3>
            <div>
              <p>Luces:</p>
              <button onClick={() => controlLights('on')}>Encender Luces</button>
              <button onClick={() => controlLights('off')}>Apagar Luces</button>
              <p className="status">Estado actual de las luces: {lightsState ? 'Encendidas' : 'Apagadas'}</p>
            </div>
            <div>
              <p>Persianas:</p>
              <button onClick={() => controlShutters('open')}>Abrir Persianas</button>
              <button onClick={() => controlShutters('close')}>Cerrar Persianas</button>
              <p className="status">Estado actual de las persianas: {shuttersState ? 'Abiertas' : 'Cerradas'}</p>
            </div>
          </div>
        )}

        {mode === 'schedule' && (
          <div className="schedule-controls">
            <h3>Configurar Horario</h3>
            <div>
              <label>Hora de Encendido de Luces:
                <input type="time" value={openLightsTime} onChange={(e) => setOpenLightsTime(e.target.value)} />
              </label>
            </div>
            <div>
              <label>Hora de Apagado de Luces:
                <input type="time" value={closeLightsTime} onChange={(e) => setCloseLightsTime(e.target.value)} />
              </label>
            </div>
            <button onClick={setLightsSchedule}>Establecer Horario de Luces</button>

            <div>
              <label>Hora de Apertura de Persianas:
                <input type="time" value={openShuttersTime} onChange={(e) => setOpenShuttersTime(e.target.value)} />
              </label>
            </div>
            <div>
              <label>Hora de Cierre de Persianas:
                <input type="time" value={closeShuttersTime} onChange={(e) => setCloseShuttersTime(e.target.value)} />
              </label>
            </div>
            <button onClick={setShuttersSchedule}>Establecer Horario de Persianas</button>
          </div>
        )}

        {mode === 'auto' && (
          <div className="auto-info">
            <p>El sistema está operando en modo automático basado en los sensores.</p>
          </div>
        )}
        <button className="save-button" onClick={handleUpdateState}>Guardar estado</button>
      </div>
    </div>
  );
};

export default ControlPanel;