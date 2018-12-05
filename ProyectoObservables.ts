const inquirer= require('inquirer');
const fs = require('fs');
const rxjs = require('rxjs');
const mergeMap = require('rxjs/operators').mergeMap;
const map = require('rxjs/operators').map;

const preguntaMenu = {
    type: 'list',
    name: 'opcionMenu',
    message: 'Escoja una opción: ',
    choices: [
        '1.- Crear Equipo',
        '2.- Borrar Equipo',
        '3.- Buscar Equipo',
        '4.- Actualizar Equipo',
    ]
};

const ingresarEquipos = [{
    name: 'nombre',
    type: 'input',
    message: 'Ingrese el nombre del equipo: '
},{
    name: 'liga',
    type: 'input',
    message: 'Ingrese la liga a la que pertenece el equipo: '
},{
    name: 'capitan',
    type: 'input',
    message: 'Ingrese el capitan del equipo: '
}];
const preguntaBuscarEquipo = [
    {
        type: 'input',
        name: 'nombre',
        message: 'Ingrese el nombre del equipo a buscar',
    }
];
const preguntaEdicionEquipo = [{
    name: 'newNombre',
    type: 'input',
    message: 'Ingrese el nuevo nombre del equipo: '
}, {
    name: 'newCategoria',
        type: 'input',
        message: 'Ingrese la nueva liga del equipo: '
}, {
    name: 'newCapitan',
        type: 'input',
        message: 'Ingrese el nuevo capitan del equipo: '
}];


function inicialiarBDD() {

    return new Promise(
        (resolve, reject) => {
            fs.readFile(
                'bdd.json',
                'utf-8',
                (error, contenidoArchivo) => { // CALLBACK
                    if (error) {

                        fs.writeFile(
                            'bdd.json',
                            '{"equipos":[]}',
                            (error) => {
                                if (error) {
                                    reject({
                                        mensaje: 'Error creando',
                                        error: 500
                                    })
                                } else {
                                    resolve({
                                        mensaje: 'BDD leida',
                                        bdd: JSON.parse('{"equipos":[]}')
                                    })
                                }

                            }
                        )

                    } else {
                        resolve({
                            mensaje: 'BDD leida',
                            bdd: JSON.parse(contenidoArchivo)
                        })
                    }
                }
            )
        }
    );

}



function main() {
    const respuestaBDD$ = rxjs.from(inicialiarBDD());
    respuestaBDD$
        .pipe(
            preguntarOpcionesMenu(),
            opcionesRespuesta(),
            ejecutarAcccion(),
            guardarBaseDeDatos()
        )
        .subscribe(
            (data:RespuestaBDD) => {
                //
                console.log("\n*************Base Final*****************\n");
                console.log(data.bdd.equipos)
            },
            (error) => {
                //
                console.log(error);
            },
            () => {
                main();
                console.log('Complete');
            }
        )



}
function guardarBDD(bdd: BDD) {
    return new Promise(
        (resolve, reject) => {
            fs.writeFile(
                'bdd.json',
                JSON.stringify(bdd),
                (error) => {
                    if (error) {
                        reject({
                            mensaje: 'Error creando',
                            error: 500
                        })
                    } else {
                        resolve({
                            mensaje: 'BDD guardada',
                            bdd: bdd
                        })
                    }

                }
            )
        }
    )
}


function preguntarOpcionesMenu() {
    return mergeMap(
        (respuestaBDD: RespuestaBDD) => {
            return rxjs.from(inquirer.prompt(preguntaMenu)).pipe(
                map(
                    (respuesta: OpcionMenu) => {
                        respuestaBDD.opcionMenu = respuesta;
                        return respuestaBDD
                    }
                )
            );

        }
    )
}


function opcionesRespuesta() {
    return mergeMap(
        (respuestaBDD: RespuestaBDD) => {
            const opcion = respuestaBDD.opcionMenu.opcionMenu;
            switch (opcion) {
                case '1.- Crear Equipo':
                    return rxjs
                        .from(inquirer.prompt(ingresarEquipos))
                        .pipe(
                            map(
                                (equipo: Equipos) => { // resp ant OBS
                                    respuestaBDD.equipo = equipo;
                                    return respuestaBDD;
                                }
                            )
                        );
                case '3.- Buscar Equipo':
                    return buscarEquipo(respuestaBDD);
                    break;
                case '4.- Actualizar Equipo':
                    return preguntarNombre(respuestaBDD);
                case '2.- Borrar Equipo':
                    return borrarEquipo(respuestaBDD);
                    break;
            }
        }
    )
}


function guardarBaseDeDatos() {
    return mergeMap(// Respuesta del anterior OBS
        (respuestaBDD: RespuestaBDD) => {
            // OBS
            return rxjs.from(guardarBDD(respuestaBDD.bdd))
        }
    )
}


function ejecutarAcccion() {
    return map( // Respuesta del anterior OBS
        (respuestaBDD: RespuestaBDD) => {
            const opcion = respuestaBDD.opcionMenu.opcionMenu;
            switch (opcion) {
                case '1.- Crear Equipo':
                    const equipo = respuestaBDD.equipo;
                    respuestaBDD.bdd.equipos.push(equipo);
                    return respuestaBDD;

                case '4.- Actualizar Equipo':
                    const indice = respuestaBDD.indiceUsuario;
                    respuestaBDD.bdd.equipos[indice].nombre = respuestaBDD.equipo.nombre;
                    respuestaBDD.bdd.equipos[indice].liga = respuestaBDD.equipo.liga;
                    respuestaBDD.bdd.equipos[indice].capitan= respuestaBDD.equipo.capitan;
                    return respuestaBDD;

                case '2.- Borrar Equipo':
                    return respuestaBDD;
                case '3.- Buscar Equipo':
                    return respuestaBDD;
            }
        }
    )
}



function preguntarNombre(respuestaBDD: RespuestaBDD) {
    return rxjs
        .from(inquirer.prompt(preguntaBuscarEquipo))
        .pipe(
            mergeMap( // RESP ANT OBS
                (respuesta: BuscarEquipoPorNombre) => {
                    const indiciEquipo=respuestaBDD.bdd.equipos
                        .findIndex( // -1
                            (equipo) => {
                                return equipo.nombre === respuesta.nombre
                            }
                        );

                    if (indiciEquipo === -1) {
                        console.log('*************************');
                        return preguntarNombre(respuestaBDD);
                    } else {
                        console.log(indiciEquipo);
                        respuestaBDD.indiceUsuario = indiciEquipo;
                        return rxjs.from(inquirer.prompt(preguntaEdicionEquipo)).pipe(
                            map(
                              (respuesta: Equipos)=>{
                                   respuestaBDD.equipo ={
                                            nombre:respuesta.nombre,
                                            liga:respuesta.liga,
                                            capitan: respuesta.capitan
                                        };
                                        return respuestaBDD;
                                    }
                                )
                            );
                    }
                }
            )
        );
}


function borrarEquipo(respuestaBDD: RespuestaBDD) {
    return rxjs
        .from(inquirer.prompt(preguntaBuscarEquipo))
        .pipe(
            mergeMap( // RESP ANT OBS
                (respuesta: BuscarEquipoPorNombre) => {
                    const indiceEquipo = respuestaBDD.bdd
                        .equipos
                        .findIndex( // -1
                            (equipo: any) => {
                                return equipo.nombre === respuesta.nombre
                            }
                        );
                    if (indiceEquipo === -1) {
                        console.log('Borrar****************');
                        return preguntarNombre(respuestaBDD);
                    } else {
                        console.log(indiceEquipo);
                        return rxjs.from(promesaEliminar(respuestaBDD.bdd.equipos,indiceEquipo)).pipe(
                            map(() =>{
                                return respuestaBDD
                                }
                            )
                        )
                    }
                }
            )
        );
}

function buscarEquipo(respuestaBDD: RespuestaBDD) {
    return rxjs
        .from(inquirer.prompt(preguntaBuscarEquipo))
        .pipe(
            mergeMap(
                (respuesta: BuscarEquipoPorNombre) => {
                    const indiceEquipo = respuestaBDD.bdd.equipos
                        .findIndex( // -1
                            (equipo) => {
                                return equipo.nombre === respuesta.nombre
                            }
                        );
                    if (indiceEquipo === -1) {
                        console.log('Buscar***********');
                        return preguntarNombre(respuestaBDD);
                    } else {
                        return rxjs.from(promesaBuscar(respuestaBDD.bdd.equipos[indiceEquipo])
                        ).pipe(
                            map(() =>{
                                return respuestaBDD
                                }
                            )
                        )
                    }
                }
            )
        );
}


const promesaBuscar = (respuestaBDD) =>{
    return new Promise(
        (resolve) => {
            const resultado = {
                respuesta: respuestaBDD
            };
            console.log('\nRespuesta:\n', respuestaBDD);
            resolve(resultado)
        }
    )};

const promesaEliminar = (respuestaBDD,indiceEquipo) =>{
    return new Promise(
        (resolve) => {
            resolve(respuestaBDD.splice(indiceEquipo, 1))
        }
    )};

main()

interface RespuestaBDD {
    mensaje: string;
    bdd: BDD;
    opcionMenu?: OpcionMenu;
    indiceUsuario?: number;
    equipo?: Equipos;
}
interface BDD {
    equipos: Equipos[] | any ;
}
interface Equipos {
    nombre: string;
    liga: string;
    capitan: string;
}
interface OpcionMenu {
    opcionMenu: '1.- Crear Equipo' | '2.- Borrar Equipo' | '3.- Buscar Equipo' | '4.- Actualizar Equipo';
}
interface BuscarEquipoPorNombre {
    nombre: string;
}