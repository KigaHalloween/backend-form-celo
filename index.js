const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();
const port = 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// resposavel por conectar ao bd
const bd = new sqlite3.Database("usuarios.db");

// responsavel por criar a tabelar "usuarios" se ela não existir
bd.serialize(() => { 
	bd.run(`
		CREATE TABLE IF NOT EXISTS usuarios (
		id INTEGER PRIMARY KEY,
		nome TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		senha TEXT NOT NULL,
		tipoUsuario TEXT NOT NULL
		)
	`);
});

app.post("/cadastrar_usuario", async (req, res) => {
	
	
	console.log(req.body);
	const { nome, email, senha, tipoUsuario } = req.body;

	//Teste basico
	if (!nome || !email || !senha || !tipoUsuario){
		return res.status(400).json({ erro: "Todos os campos devem ser preenchidos"});
	}

	try {
		//criptografa a senha
		const senhaCriptografada =  await bcrypt.hash(senha, 10);

		bd.run(
			`INSERT INTO usuarios (nome, email, senha, tipoUsuario) VALUES ( ?, ?, ?, ?)`,
			 [ nome, email, senhaCriptografada, tipoUsuario],

			 function (err){
				if(err){
					console.error(err.message);
					return res.status(500).json({ error: "erro ao cadastrar usuario"});
				}
				res.status(201).json({message: "Usuario cadastrado."});
			 }
		);
	} catch (err){
		console.error(err.message);
		res.status(500).json({error: "Erro de servidor"});
	}

});

app.listen(port, () =>{
	console.log(`Servidor localizado em http://localhost:${port}`)
});


