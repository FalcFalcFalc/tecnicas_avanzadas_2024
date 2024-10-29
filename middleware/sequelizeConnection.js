import { Sequelize } from 'sequelize';

const sequelizeConnection = new Sequelize({
    dialect: "mysql",
    host:     "localhost",
    username:     "root",
    password: "contraseña12345",
    database: "db_tp",
    port: 3306,
    define: {
        freezeTableName: true,
    },
});

sequelizeConnection
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database: ', error);
    });

export default sequelizeConnection;

