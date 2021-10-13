const express = require('express');
const carController = require('./controllers/CarController');


const routes = express.Router(); // usado para fazer as rotas

routes.get('/', function(req,res){
    res.json({message: "Bem vindo !"})
})

routes.get('/car', carController.index)
routes.get('/car/getCategoryButtons', carController.getButtons)
routes.get('/car/getByFilters', carController.getByFilters)
routes.get('/car/getBySimulationResult', carController.getBySimulationResult)
routes.get('/megaassinatura', carController.loadPage)



module.exports = routes // suficiente para exportar todas as rotas