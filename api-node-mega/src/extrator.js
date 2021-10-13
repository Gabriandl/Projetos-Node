const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const Car = require('./models/car')


/*async create(req, res) {
    const { nome, descricao, img } = req.body;

    let data = {};

    let user = await Car.findOne({ nome }) //buscando um usuaario com o email que ele esta tentando cadastrar
    if (!user) { // se nao existir o user atraves do email ele vai cadastrar executando isso
        data = { nome, descricao, img } // vars vindo co corpo
        car = await Car.create(data) // criando o user atraves das var que vem do corpo
        return res.status(200).json(car)
    }else{
        return res.status(500).json(car)
    }*/

async function unidas() {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        let carrosUnidas = [];
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        const URL = 'https://livre.unidas.com.br/carros/' //req.query.modelo
        await page.goto(URL);

        //const botao = document.querySelectorAll('')[0];
        //if (await page.click('.btn-outline-primary') != undefined){
            await page.click('.btn-outline-primary');
            await page.click('.btn-outline-primary');
            await page.click('.btn-outline-primary');


        //}
            


        let slugList = await page.evaluate(() => {
            

            const cardsCarro = document.querySelectorAll('.card-catalog-body');

            let slugList = []
            for (s = 0; s < cardsCarro.length; s++) {
                let slug = cardsCarro[s].getElementsByTagName('a')[0].href.split('/')[4];
                slugList.push(slug)
            }
           
            return slugList
        } );
        await browser.close();
        console.log({ EXTRACTOR :slugList})
            for (c = 0; c < slugList.length; c++) {
                let fetchParams = {
                    method: 'POST',
                    headers: {
                        'origin':'https://livre.unidas.com.br',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        
                            "slug": slugList[c],
                            "hash": null,
                            "promotionalCode": null,
                            "period": null,
                            "franchise": null,
                            "shadeCode": null,
                            "upsellingOptions": [],
                            "renovation": false
                        
                    })
                }
               // console.log(slugList[c])
                console.log({ EXTRACTOR :fetchParams.body})
               
                const URL2 = `https://apiportal-livre.unidas.com.br/api/Cms/vehicleDetail`;

                let response = await fetch(URL2, fetchParams)
                
                let carro1 = await response.json();
                //carros = JSON.parse());
                let carro = carro1.data.acf;
                //let carroJson = [];


                let nomeCarro = carro.imagensTextos.nomeComercial;
                let descricao = carro.imagensTextos.descricao;
                let categoria = carro.informacoesModelo.categoria[0].slug;
                let slug = carro1.data.slug;

                let imgTemp = carro.imagensTextos.imagemDestaque;
                //let img =imgTemp[1];
                //let franqPlan = cardCarro.querySelector('.pkg').getElementsByTagName('span')[0].textContent.split('|');

                let franquia =`Franquia de ${carro.precificacao.franchise.value.toLocaleString('pt-br')} km` ;
                let plano = `Plano de ${carro.precificacao.period.value} meses`;
                let parcelasInt = carro.precificacao.value ;

                let parcelasTemp = parcelasInt.toLocaleString('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                });
                let parcelas = parcelasTemp + "/mês";

                //let condicoes = '';
                let empresa = "Unidas";
                let link = `https://livre.unidas.com.br/carros/${slugList[c]}`;
                let marca = carro.informacoesModelo.marca.descricao;
                let observacoes = carro.precoTextoDesconto;

                carrosUnidas.push({
                    nome: nomeCarro,
                    descricao: descricao,
                    img: imgTemp,
                    franquia: franquia,
                    plano: plano,
                    categoria: categoria,
                    parcelasInt: parcelasInt,
                    parcelas: parcelas,
                    observacoes: observacoes,
                    empresa: empresa,
                    marca: marca,
                    link: link,
                    slug: slug
                });
            }
        
        
        for (i = 0; i < carrosUnidas.length; i++) {

            
            car = await Car.updateOne({slug:carrosUnidas[i].slug},carrosUnidas[i],{ upsert: true });
           // console.log(car)
            if (car.modifiedCount == 1){
                console.log({ EXTRACTOR :`Carro ${carrosUnidas[i].nome} , empresa ${carrosUnidas[i].empresa} atualizado na base de dados`})
            } else {
                console.log({ EXTRACTOR :`Carro ${carrosUnidas[i].nome} , empresa ${carrosUnidas[i].empresa} adicionado a base de dados`})
            }
        }

    } catch (e) {
        if (e == fetch.FetchError ){
            console.log({ ERROR : e});
            unidas();
        }

        console.log({ ERROR : e});
    }
};

async function movida() {
    try {
        //const marca = req.query.marca;
        //const modeloDigitado = req.query.modelo;
        let carrosMovida = [];

        let fetchParams = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
        const URL = `https://be-zkm.movidacloud.com.br/api/v2/booking/showcase?data_retirada=27/11/2021%2023:59&data_devolucao=29/09/2024%2023:59&local_retirada=380&local_devolucao=380`;
        const response = await fetch(URL, fetchParams);
        let carros1 = await response.json();
        //carros = JSON.parse());
        let carros = carros1.data.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails;
        let carrosJson = [];


        for (m = 0; m < carros.length; m++) {
            //if (carros[m].VehAvail.VehAvailCore.Vehicle.VehMakeModel.Name.toLocaleLowerCase().includes(modeloDigitado.toLocaleLowerCase())) {
            carrosJson = carros[m];
            //m = carros.length; //para sair do for
            // }


            let nomeCarro = carrosJson.VehAvail.VehAvailCore.Vehicle.VehMakeModel.Name;
            let descricao = carrosJson.VehAvail.VehAvailCore.Vehicle.Description ;
            //console.log("#####");
            let codFipe = carrosJson.VehAvail.VehAvailCore.Vehicle.FipeCode;
            let imgTemp = 'https://storage.googleapis.com/storage-public-images/zerokm/prod/vehicles-fipe/' + codFipe + '.png';
            //let img =imgTemp[1];

            //console.log("########");
            //let franqPlan = cardCarro.querySelector('.pkg').getElementsByTagName('span')[0].textContent.split('|');

            let franquia = 'Franquia 1.000 km';
            let plano = 'Plano de 36 meses';
            let slug = carrosJson.VehAvail.VehAvailCore.Vehicle.FipeCode;
            let categoria = carrosJson.VehAvail.VehAvailCore.Vehicle.Categoria.toLocaleLowerCase();
            let parcelasInt =  carrosJson.VehAvail.VehAvailCore.TotalCharge.Periods[0].valor_mensal_total ;
            let parcelasTemp = carrosJson.VehAvail.VehAvailCore.TotalCharge.Periods[0].valor_mensal_total.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL'
            });
            let link = 'https://movidazerokm.com.br/assinatura/detalhes/' + nomeCarro.toLocaleLowerCase().replace(' ', '-') + '/' + codFipe
            let parcelas = parcelasTemp + "/mês*";
           // let condicoes = carrosJson.VehAvail.VehAvailCore.VehAvailInfo.MessagePromocaoVeiculo;
            let empresa = "Movida";
            let marca = carrosJson.VehAvail.VehAvailCore.Vehicle.VehMakeModel.Name.split(' ')[0];
            let observacoes = carrosJson.VehAvail.VehAvailCore.VehAvailInfo.MessagePromocaoVeiculo;




            carrosMovida.push({
                nome: nomeCarro,
                descricao: descricao,
                img: imgTemp,
                franquia: franquia,
                plano: plano,
                categoria: categoria,
                parcelasInt: parcelasInt, 
                observacoes: observacoes,
                parcelas: parcelas,
                empresa: empresa,
                marca: marca,
                link: link,
                slug: slug
            });
        }
        for (i = 0; i < carrosMovida.length; i++) {
   

            car = await Car.updateOne({slug:carrosMovida[i].slug},carrosMovida[i],{ upsert: true });
            if (car.modifiedCount == 1){
                console.log({ EXTRACTOR :`Carro ${carrosMovida[i].nome} , empresa ${carrosMovida[i].empresa} atualizado na base de dados`})
            } else {
                console.log({ EXTRACTOR :`Carro ${carrosMovida[i].nome} , empresa ${carrosMovida[i].empresa} adicionado a base de dados`})
            }
        }



    } catch (e) {

        console.log({ ERROR :e});
    }
}
async function porto() {
    const browser = await puppeteer.launch();
    const result = [];
  
   // await page.setRequestInterception(true);
   

    puppeteer.launch({ userDataDir: './data/' }).then(async browser => {
        const page = await browser.newPage();
        const client = await page.target().createCDPSession();
        await client.send('Network.enable');
        await page.setDefaultNavigationTimeout(0);
      
        // added configuration
        await client.send('Network', {
          patterns: [{ urlPattern: '*' }],
        });
      
        await client.on('Network', async e => {
          console.log('EVENT INFO: ');
          console.log(e);
          console.log(e.resourceType);
          console.log(e.isNavigationRequest);
      
          // pass all network requests (not part of a question)
          await client.send('Network.', {
            interceptionId: e.interceptionId,
          });
        });
      
        await page.goto('https://www.portosegurocarrofacil.com.br/veiculos?');
        await browser.cose();
      });
  
  
  
  };
 
/*
unidas();
movida();
setInterval(function () {
    unidas();
    movida();
    console.log({ EXTRACTOR_TIMER :"Every 1 hour"}); 
}, 3600000); 

//module.exports = unidas();//, movida()];*/
porto()