const express = require('express');
const {models} = require('../../sequelize');
const router = express.Router();

// Obtener lista de aulas
router.get('/getClassroom', async (req, res) => {
    const classrooms = await models.classroom.findAll({
        attributes: ['id', 'name']
    });
    res.json(classrooms);
})

router.get('/latestClassroomEvent', async (req, res) => {
    const classrooms = await models.classroom.findAll({
        include: [
            {
                model: models.event,
                as: 'events',
                include: [{model: models.user, attributes: ['firstName', 'surName']}],
                limit: 1,
                order: [['timestamp', 'DESC']]
            }
        ]
    });

    const data = classrooms.map(classroom => {
        const lastEvent = classroom.events[0];
        if (!lastEvent) return {classroomId: classroom.id, lastState: null};

        return {
            classroomId: classroom.id,
            lastState: {
                mode: lastEvent.mode,
                lights: lastEvent.lights,
                shutters: lastEvent.shutters,
                user: lastEvent.user ? `${lastEvent.user.firstName} ${lastEvent.user.surName}` : null,
                timestamp: lastEvent.timestamp
            }
        };
    });

    res.json(data);
});

module.exports = router;