'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Timeline extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Timeline.belongsTo(models.Associate, {
                foreignKey: 'associate_id'
            })
        }
    }
    Timeline.init({
        associate_id: DataTypes.INTEGER,
        date_range: {
            type: DataTypes.RANGE(DataTypes.DATEONLY),
            allowNull: false, // Champ "start_date" ne peut pas être NULL
        },
        imputation_percentage: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Timeline',
    });
    Timeline.sync();
    return Timeline;
};