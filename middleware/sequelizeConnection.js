const { Sequelize } = require('sequelize');
const { MySqlDialect } = require('@sequelize/mysql');

const sequelizeConnection = new Sequelize('sqlite::memory:',{
    dialect: MySqlDialect,
    host:     "localhost",
    user:     "root",
    password: "contraseña12345",
    database: "db_tp",
    port: 3306,
    define: {
        freezeTableName: true,
    },
});

module.exports = sequelizeConnection;
