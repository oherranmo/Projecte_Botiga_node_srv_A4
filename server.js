const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const {FieldValue, getFirestore} = require('firebase-admin/firestore')
const mysql = require('mysql');
app.use(cors());
app.use(express.json());

port = 3080;
app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});

//connectar bd relacional Mysql____
const connectionMysql = mysql.createConnection({
    host: 'localhost', //Canviar per ip del servidor un cop estigui el node alla?
    user: 'root',
    password: 'admin',
    database: 'projecta_botiga'
});
connectionMysql.connect((err)=>{
    if (err) throw err;
    console.log('Connectat a la BDD!');
});
//______________________________________

var admin = require("firebase-admin");
var serviceAccount;
var fitxer;
var db;
fs.readFile('./ConnexioBD','utf-8',(error, contingut)=> {
    if (error){
        console.error(error);
        return;
    }else {
        fitxer = contingut;
        serviceAccount = require(fitxer);
        const {getFirestore} = require("firebase-admin/firestore");
        const {firestore} = require("firebase-admin");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = getFirestore();
        dbConnection();
    }
}) ;



async function dbConnection(){
    const conn = db.collection("book-net").doc("clients");
    const doc = await conn.get();
    if (!doc.exists){
        console.log("El document no existeix!")
    }else{
            app.get('/api/firebase',async (req, res) => {

                const conn = db.collection("book-net").doc("clients");
                const doc = await conn.get();

                const document = doc.data();
                res.json(document);
            })

    }
}
app.post('/signup', async (req, res) =>{
    const userResponse = await admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
        emailVerified: false,
        disabled: false,
    });
    res.json(userResponse);
})
app.post('/datausers',(req, res) => {
    db.collection("book-net").doc("clients").set({
        clients: FieldValue.arrayUnion({
            Adreça: req.body.Adreça,
            Cognoms: req.body.Cognoms,
            Correu: req.body.Correu,
            Nom: req.body.Nom,
            Telèfon: req.body.Telèfon})
    },{merge:true})
})

app.post('/datausersdelete',(req, res) => {
    db.collection("book-net").doc("clients").update({
        clients: FieldValue.arrayRemove({
            Adreça: req.body.Adreça,
            Cognoms: req.body.Cognoms,
            Correu: req.body.Correu,
            Nom: req.body.Nom,
            Telèfon: req.body.Telèfon})
    })
})

app.post('/contacte', (req, res)=>{
    let data = new Date();
    let dia = data.getDate();
    let mes = data.getMonth() + 1;
    let any = data.getFullYear();
    let hora = data.getHours();
    let minuts = data.getMinutes();
    let segons = data.getSeconds();
    let data_completa = `${dia}${mes}${any}${hora}${minuts}${segons}`;
    let fitxerContacte = fs.createWriteStream(`Contacte/${data_completa}_contacte.txt`);
    fitxerContacte.write(req.body.nom+"\n");
    fitxerContacte.write(req.body.correu+"\n");
    fitxerContacte.end(req.body.missatge);
})

app.get('/imatges/:nom',(req,res)=>{
    const nomImatge = req.params.nom;
    const rutaImatge = `${__dirname}/Imatges/${nomImatge}`;
    const stream = fs.createReadStream(rutaImatge);
    stream.pipe(res);
})

app.post('/log',(req,res)=>{
    let data = new Date();
    let dia = data.getDate();
    let mes = data.getMonth() + 1;
    let any = data.getFullYear();
    let hora = data.getHours();
    let minuts = data.getMinutes();
    let segons = data.getSeconds();
    let data_completa = `${dia}${mes}${any}${hora}${minuts}${segons}`;
    fs.writeFileSync(`log/${req.body.log}.log`, `${data_completa} ${req.body.text}\n`,{flag:'a+'});
})

// Projecte Botiga A5


app.get('/productes', (req, res) => {
    connectionMysql.query('SELECT * FROM projecta_botiga.productes_botiga', (error, results) => {
        if (error) throw error;
        res.send(results);
    });
});

app.post('/log/compraproductes', (req, res) => {
        const query = req.body.query;
        const values = req.body.values;
        connectionMysql.query(query,values, (err, result)=>{
            if (err){
                res.status(500).send(`Error: ${err}`);
            }else{
                res.send(`Registre inserit amb èxit`);
            }
        });
});

