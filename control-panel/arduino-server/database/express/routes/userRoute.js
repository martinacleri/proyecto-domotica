const express = require('express');
const bcrypt = require('bcrypt');
const {models} = require('../../sequelize');
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    const defaultPassword = "UTNSanFco2024";
    const {email, firstName, surName} = req.body;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const newUser = await models.user.create({email, password: hashedPassword, firstName, surName});
    res.json({message: 'Usuario registrado con éxito', userId: newUser.id});
})

// Inicio de sesión de usuario
router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await models.user.findOne({where: {email}});
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({error: 'Credenciales incorrectas'});
    }
    res.json({message: 'Inicio de sesión exitoso', userId: user.id});
})

// Obtener usuario (para ver quién hizo la última modificación manual)
router.get('/getUser', async (req, res) => {
    const user = await models.user.findByPk(req.user.id, {
        attributes: ['firstName', 'surName']
    });
    if (!user) {
        return res.status(404).json({message: 'Usuario no encontrado.'});
    }
    res.json({firstName: user.firstName, surName: user.surName});
})

module.exports = router;