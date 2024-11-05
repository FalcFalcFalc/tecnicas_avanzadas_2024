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
        console.log('Conexion establecida!');
    })
    .catch((error) => {
        console.error('Error al conectar con la base: ', error);
    });

    /**
     * Constante de conexion a la ORM/MySQL
     */
export default sequelizeConnection;

