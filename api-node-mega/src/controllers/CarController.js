
const Car = require('../models/car')


module.exports = {
    async index(req, res) {
        const car = await Car.find().sort({parcelasInt:1});

        res.json({status: 'sucesso',response: car})
    },
    async getButtons(req, res) {
        const categoria = await Car.find({}, {categoria: 1});
        let categoriaRotulos = [];
        for (i=0; i<categoria.length;i++){
            if(!categoriaRotulos.includes(categoria[i].categoria.toLocaleUpperCase()) && categoria[i].categoria != ''){
                categoriaRotulos.push(categoria[i].categoria.toLocaleUpperCase())
            }
        }
        res.json({status: 'sucesso',response: categoriaRotulos})
    },
    async getByFilters(req, res) {

            let carros

            //cATEGORIA= S PARCELA=S SORT=S
            if (req.query.categoria == 'seeAll'){
                carros = await Car.find({$and : [{parcelasInt:{$gte:parseInt(req.query.menorParcela)}},{parcelasInt:{$lte:parseInt(req.query.maiorParcela)}},{}]}).sort({parcelasInt:parseInt(req.query.ordem)});
      
            } else{
                carros = await Car.find({$and : [{parcelasInt:{$gte:parseInt(req.query.menorParcela)}},{parcelasInt:{$lte:parseInt(req.query.maiorParcela)}},{categoria:`${req.query.categoria}`}]}).sort({parcelasInt:parseInt(req.query.ordem)});
            }
            res.json({status: 'sucesso',response: carros})
             
    },
    async getBySimulationResult(req, res) {

            let valor = parseInt(req.query.parcela);
            let valorMax = valor + 500;
            let valorMin = valor - 500;

            const carros = await Car.find({$and : [{parcelasInt:{$gte:valorMin}},{parcelasInt:{$lte:valorMax}}]}).sort({parcelasInt:1}).limit(3);
      
            res.json({status: 'sucesso',response: carros})
      

        
    
    },
    async create(req, res) {
        const { nome, descricao, img } = req.body;

        let data = {};

        let user = await Car.findOne({ nome }) //buscando um usuaario com o email que ele esta tentando cadastrar
        if (!user) { // se nao existir o user atraves do email ele vai cadastrar executando isso
            data = { nome, descricao, img } // vars vindo co corpo
            car = await Car.create(data) // criando o user atraves das var que vem do corpo
            return res.status(200).json(car)
        }else{
            return res.status(500).json(car)
        }
    },
    async loadPage(req, res) {
        res.sendFile(__dirname + '/simular.html')
    }

}



/*
router.post('/car', async (req, res) => {
    try{
        const car = await Car.create(req.body);

        return res.send({ car });
    
    } catch (err) {
        console.log(err);
        return res.status(400).send({error: 'Fail on find cars'})
    }
});

module.exports = app => app.use('/api', router);*/