const rxjs = require('rxjs');
const inquirer = require('inquirer');
const fs = require('fs');
let string2;
const string1 = fs.readFile('usuarios.json', 'utf-8', (error, contenidoLeido) => {
    if (error) {
    }
    else {
        let equipo = {
            nombre: '',
            numeroJugadores: 0,
            liga: '',
            pais: '',
            capitan: ''
        };
    }
});
let equipo = '{"nombre":"real madrid","numeroJugadores":"45","liga":"santander","pais":"espaniola","capitan":"sergio ramos"}';
let equipo2 = equipo.split('"', equipo.length);
console.log(equipo2);
let equipo3 = equipo2.filter((valorActual) => {
    return valorActual != ':'; // siempre se debera usar 3 iguales siempre nucna dos iguales en javascript, evalua lacondicion de si valorActual % 2 es 0 solo coge eso a los que son treu
});
console.log(equipo3);
