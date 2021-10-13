const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const mongoose = require('mongoose')
const routes = require('./src/routes.js')
const extrator = require('./src/extrator')

const app = express()

mongoose.connect('mongodb+srv://gabriel:12345@megaassinatura.h2guq.mongodb.net/Carros?retryWrites=true&w=majority', { // tudo padrao
useNewUrlParser: true, 

useUnifiedTopology: true 
},function(err){
    if(err){
        console.log(err)
    }else{
        console.log({SERVER: "Mongo Db conectado com sucesso"})
    }
})
app.use((req, res, next) => {
    //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
    //Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET');
    app.use(cors());
    next();
  });

app.use(cookieParser())
app.use(express.json())
app.use(routes)

//app.use(extrator)

 

app.listen(process.env.PORT || 3003, function(){
    console.log({SERVER:"App Iniciando na porta 3003"})
})