const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    nome: String,
    
    descricao: String,
   
    img: String,

    franquia: String,

    plano: String,

    categoria: String,

    marca: String,

    observacoes: String,

    parcelasInt: Number,

    parcelas: String,

    empresa: String,
    
    link: String,

    slug: String


    }, {
        timestamps: true // data de criação e edição
    });  
     
    /*franquia: { 
        type: String,
     },
    plano: { 
        type: String,
     },
    parcelas: { 
        type: String,
     },
    condicoes: { 
        type: String,
     },
    empresa: { 
        type: String,
     },
    link: { 
        type: String,
     },
    cidadeDiponivel: { 
        type: String,
     }*/



const car = mongoose.model('Cars', CarSchema);

module.exports = car;