# Tecnicas avanzadas 2024
Repositorio para Tecnicas avanzadas de programacion
## Sistema de retiro de bicicletas
El ejercicio que elegí fue el de el servicio de bicicletas de la ciudad.
### Modelo
#### Estructura
Contamos con 4 objectos principales:
1. Bicicletas;
2. Estaciones;
3. Usuarios;
4. y Retiros
#### Relaciones
Cada **bicicleta** puede tener de 0 a 1 **estaciones** asignadas.
Cada **estacion** puede tener de 0 a n **bicicletas** asignadas
Cada **retiro** tiene
- un **usuario**
- una **bicicleta**
- un timestamp de retiro y otro de devolucion
- una **estacion** de salida y otra de llegada
#### Acciones
Para abrir un retiro se requiere de una bicicleta y de un usuario. La bicicleta es tomada como parámetro, el usuario es tomado desde la sesión actual. Desde la bicicleta se toma la estación de origen, se la elimina de la bicicleta y se graba la primera timestamp.
Para cerrar un retiro se requiere de una bicicleta y una estacion. A la bicicleta se le asigna la nueva estación, la cual también es grabada en el retiro. Se graba la segunda timestamp y basandose en la diferencia entre el inicio y el fin se caulcula la deuda generada por el usuario, dando 30 minutos de gracia.
### Middlewares
#### Auth-Middleware
Auth-Middleware es una coleccion de métodos que filtran si es que el usuario inició sesion o no, y si es administrador o no.
#### Calculadora de Deuda
Con este middleware me encargo de apreciar cada uno de los alquileres de las bicicletas
#### EJS Renderer
Se utiliza para poder renderizar el front end utilizando Server Side Rendering
#### Paginacion
En paginacion genero parámetros para poder páginar todas las búsquedas realizadas dentro del sistema
#### Query Filtering
El método filter no permite la ejecución de criterios asincrónicos por lo que hice este pequeño componente para poder ejecutar funciones asincrónicamente y en base a eso poder filtrar queries.
#### Sequelize Connection
Centraliza todo lo que es la conexión a la ORM utilizada