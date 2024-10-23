@Entity
@Table(name='Retiro')
public class Retiro {
    @ManyToOne @JoinColumn(name = "user_id")
    private int userId;

    @ManyToOne @JoinColumn(name = "bici_id")
    private int biciId;

    private Date timeStart;
    
    private int estacionStartId;
    private Date timeEnd;
    private int estacionEndId;

    public Retiro(Bicicleta bici, Usuario user){
        this.userId = user.GetId();
        this.biciId = bici.GetId();
        this.estacionStartId = bici.GetEstacionId();
        
        this.timeStart = new Date().valueOf();

        this.timeEnd = null;
        this.estacionEndId = null;
    }

    public Cerrar(Estacion estacion){
        this.timeEnd = new Date().valueOf();
        this.estacionEndId = estacion.GetId();
    }
}

@Entity
@Table(name='Bicicleta')
public class Bicicleta {
    @Id @Generated(strategy = GenerationType.IDENTITY)
    private int biciId;

    private String biciCodigo;    
    private int estacionId;

    public void Devolver(Estacion estacion){
        estacionId = estacion.GetId();
    }

    public void Retirar(){
        estacionId = null;
    }

    public Retiro GetUltimoRetiro(){
        String query = // SELECT *
                         "FROM Retiro 
                         WHERE  bici_id      = :biciId 
                            AND estacion_end IS NULL"

        List<Retiro> retiros = session.createQuery(query)   // Crea un template,
            .setParameter("biciId",this.biciId)             // Especifica busqueda,
            .list();                                        // Ejecuta.

                                                            // Devolvemos el primero, 
        return retiros[0];                                  // (deberia ser unico)
    }
}

@Entity
@Table(name='Usuario')
public class Usuario {
    @Id @Generated(strategy = GenerationType.IDENTITY)
    private int userId;

    private String nombre;    
    private String apellido;    
    private int deuda_actual;
    private int deuda_historica;

    public RetirarBici(int biciId) {
        Bicicleta bici = session.get(Bicicleta.class, biciId);

        bici.Retirar()

        session.save(new Retiro(bici,this))
        session.update(bici);
    }
}

@Entity
@Table(name='Estacion')
public class Estacion {
    @Id @Generated(strategy = GenerationType.IDENTITY)
    private int estacionId;

    @ManyToOne @JoinColumn(name = "barrio_id")
    private int barrioId;

    private int capacidad;

    public DevolverBici(Bicicleta bici) {
        Retiro retiro = bici.GetUltimoRetiro();
        
        retiro.Cerrar(this);
        bici.Devolver(this);

        session.update(retiro);
        session.update(bici);
    }
}

@Entity
@Table(name='Barrio')
public class Barrio {
    @Id @Generated(strategy = GenerationType.IDENTITY)
    private int barrioId;

    private String nombre;
}