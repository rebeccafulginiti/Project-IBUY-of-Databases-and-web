const express = require("express"); //express framework for REST api
const fileupload = require("express-fileupload");

const swaggerUi = require('swagger-ui-express'); // swagger UI to interrogate REST api
const swaggerFile = require('./swagger-output.json') //provide files uploaded from forms inside request


const app = express(); //inizializza express >> framework for rest
const port = 3000 ;
//middleware universali 
//ci serve che expres sappia accettare le richieste via http utilizzando gli indirizzi standard
app.use(express.urlencoded({extended: true}))

//e che ci sappia dare delle risposte 
app.use(express.json())
app.use(fileupload())

app.listen(port, () => {
    console.log(`Server active on port ${port}`)
})

app.get('/',(req,res) => {
    res.json({info:'Node.js and Express online'})
})
require('./endpoints')(app)

//fai partire servizio swagger che mostra l'interfaccia utente 
//andrà a pesacre gli endpoint dal file json
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))