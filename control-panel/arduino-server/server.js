const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

let controlMode = "auto"; // Estado inicial

// Ruta para obtener el modo de control
app.get('/api/getMode', (req, res) => {
  console.log("GET /api/getMode - Modo actual:", controlMode); // Log para confirmar la llamada
  res.send(controlMode);
});

app.post('/api/setMode', (req, res) => {
  const { mode } = req.body;
  controlMode = mode;
  console.log(`POST /api/setMode - Modo de control cambiado a: ${controlMode}`); // Log para confirmar el cambio de modo
  res.send({ message: `Modo cambiado a ${controlMode}` });
});

let deviceStates = { luces: 'off', persianas: 'close' };

app.post('/api/manualControl', (req, res) => {
  const { action, device } = req.body;
  console.log(`POST /api/manualControl - Acción manual recibida: ${action} en ${device}`);
  
  // Actualizar el estado del dispositivo
  if (device === 'luces') {
    deviceStates.luces = action === 'encender' ? 'on' : 'off';
  } else if (device === 'persianas') {
    deviceStates.persianas = action === 'abrir' ? 'open' : 'close';
  }

  res.send({ message: `Acción ${action} en ${device} ejecutada` });
});

// Endpoint para que el Arduino obtenga el estado actual
app.get('/api/getManualStatus', (req, res) => {
  res.json(deviceStates);
});

// Variables para almacenar los horarios configurados
let scheduleLights = { openTime: '08:00', closeTime: '20:00' };
let scheduleShutters = { openTime: '08:00', closeTime: '20:00' };


app.post('/api/schedule/lights', (req, res) => {
  const { openTime, closeTime } = req.body;
  console.log(`Horario de luces: Encendido a las ${openTime}, Apagado a las ${closeTime}`);
  scheduleLights = { openTime, closeTime };
  res.send({ message: `Horario de luces configurado: Encendido a las ${openTime}, Apagado a las ${closeTime}` });
});

app.post('/api/schedule/shutters', (req, res) => {
  const { openTime, closeTime } = req.body;
  console.log(`Horario de persianas: Apertura a las ${openTime}, Cierre a las ${closeTime}`);
  scheduleShutters = { openTime, closeTime };
  res.send({ message: `Horario de persianas configurado: Apertura a las ${openTime}, Cierre a las ${closeTime}` });
});

app.get('/api/getScheduleStatus', (req, res) => {
  res.json({
    lights: scheduleLights,
    shutters: scheduleShutters,
  });
});


app.listen(port, () => {
  console.log(`Servidor escuchando en http://192.168.0.143:${port}`);
});
