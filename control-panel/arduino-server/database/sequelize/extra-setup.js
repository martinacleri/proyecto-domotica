function applyExtraSetup(sequelize) {
	const {classroom, event, user} = sequelize.models;

	event.belongsTo(user, {foreignKey: 'userId'});
	user.hasMany(event, {foreignKey: 'userId'});
    event.belongsTo(classroom, {foreignKey: 'classroomId'});
    classroom.hasMany(event, {foreignKey: 'classroomId'});
}

module.exports = { applyExtraSetup };