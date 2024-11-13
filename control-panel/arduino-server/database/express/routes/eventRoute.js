const express = require('express');
const {models} = require('../../sequelize');
const router = express.Router();

// Registrar un nuevo "evento"
router.post('/newEvent', async (req, res) => {
    const {mode, lights, shutters, userId, classroomId, scheduleEndTime} = req.body;

    console.log("Datos recibidos en el backend:", req.body);

    const newEvent = await models.event.create({
        mode,
        lights,
        shutters,
        userId,
        classroomId,
        timestamp: new Date(),
        scheduleEndTime: mode === 'schedule' ? new Date(scheduleEndTime) : null,
    });
    res.json({message: 'Evento registrado correctamente.', event: newEvent});
})

// Obtener el último estado de un aula
router.get('/latestEvent/:classroomId', async (req, res) => {
    const {classroomId} = req.params;
    console.log(`Buscando el último evento para el aula con ID ${classroomId}`);
    const latestEvent = await models.event.findOne({
        where: {classroomId},
        include: 
            {model: models.user, attributes: ['firstName', 'surName']},
        order: [['timestamp', 'DESC']]
        });
        if (!latestEvent) {
            console.log(`No se encontraron eventos para el aula con ID ${classroomId}`);
            return res.status(404).json({message: 'No se encontraron eventos recientes para el aula.'})
        }
        res.json(latestEvent);
});

module.exports = router;