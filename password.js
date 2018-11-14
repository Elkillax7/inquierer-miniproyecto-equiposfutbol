const rxjs = require('rxjs');
const inquirer = require('inquirer');
const fs = require('fs');
'use strict';
let estructuraEquipo = {
    nombre: '',
    numeroJugadores: 0,
    liga: '',
    pais: '',
    capitan: '',
};
//---BLOQUE DE PREGUNTAS A SER MOSTRADAS EN PANTALLA
//BLOQUE DE PREGUNTAS INICIALES
const questionsIniciales = [
    { type: 'input', name: 'nombreUsuario', message: 'INGRESA TU USUARIO: \n' },
    { type: 'password', name: 'passwordUsuario', message: 'INGRESA TU PASSWORD: \n' },
    { type: 'list', name: 'opcionMenu', message: 'QUE DESEAS HACER:\n', choices: ['INGRESAR NUEVO EQUIPO', 'CONSULTAR EQUIPOS EXISTENTES', 'BORRAR UN EQUIPO', 'ACTUALIZAR UN EQUIPO'] },
];
//BLOQUE DE PREGUNTAS PARA AGREGAR EQUIPO
const questionsAgregarEquipo = [
    { type: 'input', name: 'nombre', message: 'NOMBRE: ' },
    { type: 'input', name: 'numeroJugadores', message: 'NUMERO DE JUGADORES: ' },
    { type: 'input', name: 'liga', message: 'LIGA: ' },
    { type: 'input', name: 'pais', message: 'PAIS: ' },
    { type: 'input', name: 'capitan', message: 'CAPITAN: ' },
];
//BLOQUE DE PREGUNTAS PARA CONSULTAR UN EQUIPO
const questionsConsultarEquipo = [
    { type: 'input', name: 'claveNombre', message: 'INGRESE NOMBRE DE EQUIPO A BUSCAR: \n' },
];
//BLOQUE DE PREGUNTAS PARA BORRAR UN EQUIPO
const questionsBorrarEquipo = [
    { type: 'input', name: 'claveNombre', message: 'INGRESE NOMBRE DE EQUIPO A BORRAR: \n' },
];
//BLOQUE DE PREGUNTAS PARA ACTUALIZAR UN EQUIPO
const questionsActualizarEquipo = [
    { type: 'input', name: 'claveNombre', message: 'INGRESE NOMBRE DE EQUIPO A ACTUALIZAR: \n' },
];
//--PROMESAS Y FUNCIONES
//PROMESA PARA AANADIR UN NUEVO EQUIPO
const addNewEquipo = (equipo) => {
    return new Promise((reject, resolve) => {
        fs.writeFile('equipos.json', equipo, (error) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(equipo);
            }
        });
    });
};
//PROMESA PARA CONSULTAR LOS EQUIPOS
const consultarEquipos = (nombreArchivo) => {
    return new Promise((resolve, reject) => {
        fs.readFile(nombreArchivo, 'utf-8', (error, contenidoLeido) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(contenidoLeido);
            }
        });
    });
};
inquirer
    .prompt(questionsIniciales)
    .then((respuesta) => {
    if (respuesta.opcionMenu === 'INGRESAR NUEVO EQUIPO') {
        console.log("USTED VA A INGRESAR UN NUEVO EQUIPO\n");
        inquirer
            .prompt(questionsAgregarEquipo)
            .then((equipoAnadir) => {
            const equipoAux = JSON.stringify(equipoAnadir);
            addNewEquipo(equipoAux)
                .then((contenido) => {
                console.log(contenido);
            })
                .catch((error) => {
                console.log(error);
            });
        });
    }
    if (respuesta.opcionMenu === 'CONSULTAR EQUIPOS EXISTENTES') {
        console.log("USTED VA A CONSULTAR LOS EQUIPOS EXISTENTES\n");
        consultarEquipos('equipos.json')
            .then((listaEquipos) => {
            console.log('ESTE ES EL LISTADO DE EQUIPOS ACTUAL\n');
            console.log(listaEquipos);
        })
            .catch((error) => {
            console.log(error);
        });
    }
    if (respuesta.opcionMenu === 'BORRAR UN EQUIPO') {
        console.log("QUE EQUIPO VA A BORRAR");
    }
    if (respuesta.opcionMenu === 'ACTUALIZAR UN EQUIPO') {
        console.log("USTED VA A ACTUALIZAR UN NUEVO EQUIPO");
    }
});
