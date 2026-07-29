const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/siscetran.db", (err) => {

    if(err){
        console.log(err);
        return;
    }

    console.log("Banco conectado!");

    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE,
            senha TEXT NOT NULL
        )
    `);

});

module.exports = db;