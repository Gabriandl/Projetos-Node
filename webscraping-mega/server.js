const express = require('express');
const cors = require('cors');
const app = express();
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const PORT = process.env.PORT || 8080;

function titleize(text) {
  var loweredText = text.toLowerCase();
  var words = loweredText.split(" ");
  for (var a = 0; a < words.length; a++) {
    var w = words[a];

    var firstLetter = w[0];
    // aqui abaixo alterei 

    if (w.length > 2) {
      w = firstLetter.toUpperCase() + w.slice(1);
    } else {
      w = firstLetter + w.slice(1);
    }

    words[a] = w;
  }
  return words.join(" ");
}

app.listen(PORT, () => {
  console.log(`App is running on port ${ PORT }`);
});
app.use((req, res, next) => {
  //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
  res.header("Access-Control-Allow-Origin", "*");
  //Quais são os métodos que a conexão pode realizar na API
  res.header("Access-Control-Allow-Methods", 'GET');
  app.use(cors());
  next();
});

app.get('/api/dahruj', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });



    const page = await browser.newPage();
    await page.goto('https://www.dahrujrentacar.com.br/#/');
    let modelo = req.query.modelo;



    const pageData = await page.evaluate((modelo) => {
      const cardsCarros = document.querySelectorAll('.offer-card');
      let carroDigitado = modelo.toString();
      //const modeloDigitado =req.query.modelo;
      let listaDeCarros = [];
      let carroElegivelIndex = -1;

      for (i = 0; i < cardsCarros.length; i++) {
        const cardCarro = cardsCarros[i];
        const nomeCarro = cardCarro.querySelector('.content-holder').getElementsByTagName('h1')[0].textContent.split('\n')[1].replace('            ', '');

        const descricaoLista = cardCarro.getElementsByTagName('li');
        let descricao = '';
        for (index = 0; index < descricaoLista.length; index++) {
          if (index == 1) {
            descricao = descricaoLista[index].textContent;
          }
        }


        const img = cardCarro.querySelector('.img-holder').getElementsByTagName('img')[0].currentSrc;

        //const franqPlan = cardCarro.querySelector('.pkg').getElementsByTagName('span')[0].textContent.split('|');

        const franquia = '';
        const plano = '';

        const parcelas = cardCarro.querySelector('.small').textContent[0] + cardCarro.querySelector('.small').textContent.substr(1).toLocaleLowerCase() + " " + cardCarro.querySelector('.price').textContent.split('\n')[1].replace('            ', '') + " *";
        const condicoes = document.querySelectorAll('.conditions')[0].textContent.split('\n')[1].replace('    ', '');
        const empresa = "Dahruj Rent a Car";
        const link = cardCarro.getElementsByTagName('a')[1].href;

        listaDeCarros.push({
          nome: nomeCarro,
          descricao: descricao,
          img: img,
          franquia: franquia,
          plano: plano,
          parcelas: parcelas,
          condicoes: condicoes,
          empresa: empresa,
          link: link
        })


      }
      for (c = 0; c < listaDeCarros.length; c++) {
        if (listaDeCarros[c].nome.toLocaleLowerCase().includes(carroDigitado)) {
          carroElegivelIndex = c;
        }
      }
      let carroElegivel;
      if (carroElegivelIndex >= 0) {
        carroElegivel = listaDeCarros[carroElegivelIndex];
      } else {
        carroElegivel = {};
      }

      return carroElegivel
    }, modelo);
    console.log(pageData.descricao)
    pageData.descricao = titleize(pageData.descricao.trim()); //.replace('undefined','').replace('undefined','').replace('undefined','').replace('undefined','');
    await browser.close();

    res.send(pageData)
  } catch (e) {
    res.send({});
    console.log(e);
  }
});

app.get('/api/movida', async (req, res) => {
  try {
    const marca = req.query.marca;
    const modeloDigitado = req.query.modelo;
    let carroEscolhido = {};

    let fetchParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    const URL = `https://be-zkm.movidacloud.com.br/api/v2/booking/showcase?data_retirada=27/09/2021%2023:59&data_devolucao=29/09/2024%2023:59&local_retirada=380&local_devolucao=380`;
    const response = await fetch(URL, fetchParams);
    let carros1 = await response.json();
    //carros = JSON.parse());
    let carros = carros1.data.VehAvailRSCore.VehVendorAvails.VehVendorAvail.VehAvails;
    let carrosJson = {};


    for (m = 0; m < carros.length; m++) {
      if (carros[m].VehAvail.VehAvailCore.Vehicle.VehMakeModel.Name.toLocaleLowerCase().includes(modeloDigitado.toLocaleLowerCase())) {
        carrosJson = carros[m];
        m = carros.length; //para sair do for
      }
    }

    const nomeCarro = carrosJson.VehAvail.VehAvailCore.Vehicle.VehMakeModel.Name;
    const descricao = carrosJson.VehAvail.VehAvailCore.Vehicle.Description;
    //console.log("#####");
    const codFipe = carrosJson.VehAvail.VehAvailCore.Vehicle.FipeCode;
    const imgTemp = 'https://storage.googleapis.com/storage-public-images/zerokm/prod/vehicles-fipe/' + codFipe + '.png';
    //const img =imgTemp[1];

    //console.log("########");
    //const franqPlan = cardCarro.querySelector('.pkg').getElementsByTagName('span')[0].textContent.split('|');

    const franquia = 'Franquia 1.000 km';
    const plano = 'Plano de 36 meses';
    const parcelasTemp = carrosJson.VehAvail.VehAvailCore.TotalCharge.Periods[0].valor_mensal_total.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL'
    });
    const link = 'https://movidazerokm.com.br/assinatura/detalhes/' + nomeCarro.toLocaleLowerCase().replace(' ', '-') + '/' + codFipe
    const parcelas = parcelasTemp + "/mês*";
    const condicoes = carrosJson.VehAvail.VehAvailCore.VehAvailInfo.MessagePromocaoVeiculo;
    const empresa = "Movida";



    carroEscolhido = {
      nome: nomeCarro,
      descricao: descricao,
      img: imgTemp,
      franquia: franquia,
      plano: plano,
      parcelas: parcelas,
      condicoes: condicoes,
      empresa: empresa,
      link: link
    };



    res.send(carroEscolhido)
  } catch (e) {
    res.send({});
    console.log(e);
  }
});


app.get('/api/unidas', async (req, res) => {

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });


    const page = await browser.newPage();
    const URL = 'https://livre.unidas.com.br/carros?nomeveiculo=' + req.query.modelo
    await page.goto(URL);

    const pageData = await page.evaluate(() => {
      const cardCarro = document.querySelector('.card-catalog-body');
      const nomeCarro = cardCarro.getElementsByTagName('a')[1].getElementsByTagName('h3')[0].textContent;
      const descricao = cardCarro.getElementsByTagName('a')[1].getElementsByTagName('h4')[0].textContent

      const imgTemp = cardCarro.getElementsByTagName('a')[0].getElementsByTagName('img')[0].src;
      //const img =imgTemp[1];
      //const franqPlan = cardCarro.querySelector('.pkg').getElementsByTagName('span')[0].textContent.split('|');

      const franquia = '';
      const plano = '';

      const parcelas = cardCarro.querySelector('.bottom').getElementsByTagName('p')[0].textContent + ' ' + cardCarro.querySelector('.bottom').getElementsByTagName('a')[0].textContent;
      const condicoes = '';
      const empresa = "Unidas";
      const link = cardCarro.getElementsByTagName('a')[0].href;


      return {
        nome: nomeCarro,
        descricao: descricao,
        img: imgTemp,
        franquia: franquia,
        plano: plano,
        condicoes: condicoes,
        parcelas: parcelas,
        empresa: empresa,
        link: link
      };
    });
    await browser.close();
    res.send(pageData)
  } catch (e) {
    res.send({});
    console.log(e);
  }




});


app.get('/api/flua', async (req, res) => {
  let carroEscolhido = {};
  try {
    const marca = req.query.marca;
    const modeloDigitado = req.query.modelo;
    let modelo = '';
    const modelosElegiveis = ['compass', 'renegade', 'mobi', 'argo', 'cronos', 'strada', 'toro', 'fiorino', 'ducato'];

    for (m = 0; m < modelosElegiveis.length; m++) {
      if (modeloDigitado.includes(modelosElegiveis[m])) {
        modelo = modelosElegiveis[m]
      }
    }


    codigosCarros = {
      compass: ['675', 'jeep', 'https://www.meuflua.com.br/content/dam/jeep/products/675/12r/1/2022/page/profile-png/profile-345.png', 'https://www.meuflua.com.br/jeep.html?offerId='],
      renegade: ['611', 'jeep', 'https://www.meuflua.com.br/content/dam/jeep/products/611/15x/0/2021/page/profile-png/profile-296.png', 'https://www.meuflua.com.br/jeep.html?offerId='],
      mobi: ['341', 'fiat', 'https://www.meuflua.com.br/content/dam/fiat/products/341/abx/0/2021/page/profile-png/profile-663.png', 'https://www.meuflua.com.br/fiat.html?offerId='],
      argo: ['358', 'fiat', 'https://www.meuflua.com.br/content/dam/fiat/products/358/a4n/0/2021/page/profile-png/profile-979.png', 'https://www.meuflua.com.br/fiat.html?offerId='],
      cronos: ['359', 'fiat', 'https://www.meuflua.com.br/content/dam/fiat/products/359/a1d/0/2021/page/profile-png/profile-806.png', 'https://www.meuflua.com.br/fiat.html?offerId='],
      strada: ['281', 'fiat', 'https://www.meuflua.com.br/content/dam/fiat/products/281/a22/0/2021/page/profile-png/profile-806.png', 'https://www.meuflua.com.br/fiat.html?offerId='],
      toro: ['226', 'fiat', 'https://www.meuflua.com.br/content/dam/fiat/products/226/1pj/1/2022/page/profile-png/profile-809.png', 'https://www.meuflua.com.br/fiat.html?offerId='],
      fiorino: ['265', 'fiat', 'https://www.meuflua.com.br/content/dam/fiat/products/265/1mh/0/2021/page/profile-png/profile-249.png', 'https://www.meuflua.com.br/fiat.html?offerId='],
      ducato: ['560', 'fiat', 'https://www.meuflua.com.br/content/dam/fiat/products/560/3g3/3/2021/page/profile-png/profile-PW7.png', 'https://www.meuflua.com.br/fiat.html?offerId=']
    }
    let fetchParams = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "fq": {
          "modelCodeList": [codigosCarros[modelo][0]],
          "brand": codigosCarros[modelo][1],
          "location": {
            "countryCode": "BR",
            "stateCode": "SP",
            "cityCode": "3550308"
          }
        }
      })
    }
    const URL = `https://rental.commercial.fcalatam.com.br/rental/search`;
    const response = await fetch(URL, fetchParams);
    const carros = await response.json();
    const carrosJson = carros.hits.hit[0].fields;






    let nomeCarro = titleize(carrosJson.modelName);
    const descricao = titleize(carrosJson.fullDescription);

    const imgTemp = codigosCarros[modelo][2];

    const franqPlanPar = carrosJson.rentalPlanList[0];


    /*for(c = 0 ; c < franqPlanPar.length ; c++){
      if (franqPlanPar.period == '36')
    }*/
    let franquia = '';
    if (franqPlanPar.km.toString().length > 3) {
      franquia = 'Franquia de ' + franqPlanPar.km.toString().substr(0, 1) + '.' + franqPlanPar.km.toString().substr(1, 4) + ' km ';
    } else {
      franquia = 'Franquia de ' + franqPlanPar.km + ' km ';
    }
    const plano = 'Plano de ' + franqPlanPar.period + ' meses';

    let parcelasFormatadas = franqPlanPar.price.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL'
    });

    const parcelas = 'A partir de ' + parcelasFormatadas + '/mês';
    const features = titleize(carrosJson.features);
    const empresa = "Flua!";
    const link = codigosCarros[modelo][3] + carrosJson.id;


    carroEscolhido = {
      nome: nomeCarro,
      descricao: descricao,
      img: imgTemp,
      franquia: franquia,
      plano: plano,
      parcelas: parcelas,
      condicoes: features,
      empresa: empresa,
      link: link
    };
  } catch (e) {
    console.log(e);
    carroEscolhido = {};
  }
  res.send(carroEscolhido)
});


app.get('/api/porto', async (req, res) => {
  let carroEscolhido = {};

  try {
    const marca = req.query.marca;
    const modeloDigitado = req.query.modelo;
    const firetoken = req.query.token;


    /*let fetchParamsAuth = {
      method: 'POST',
      headers: {
        'Accept': '* /*',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=refresh_token&refresh_token=ACzBnCiGe6r9xBLZc9gLj4zxaDconxxBtSVlDmxxAXdoLEORlAQ0ZEm7bQRuqdw1OEFOQZTgE8CdjfWKpeaJz4JhKoBTwAq-AG3wCZFNT3nmJM79Re9Iaet2kjqTsvhoj8SLcYvUjsWHp2MiusWTy8AyAY38mLAAj3u-PqiPKg9YLzuTIRUqOTXdXEDqFxdVUMn8O7MFqBP92TtbC-USjYj68bbdfHfYkQ'
    }
    const URL0 = `https://securetoken.googleapis.com/v1/token?key=AIzaSyDC6TI2grKAD_vUjNXtlDo6BCPun5cHeZk`;
    const responseAuth = await fetch(URL0, fetchParamsAuth);
    console.log(responseAuth.json());
    const token = await responseAuth.json().access_token;
    console.log(token);*/

    let fetchParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'firetoken': firetoken //token
      }
    }
    const URL = `https://us-central1-carro-facil-fluxo-vendas.cloudfunctions.net/integracao/products?visible=true&disponibility_zones.initials=sp&_limit=17&_start=0`;
    const response = await fetch(URL, fetchParams);
    let carros = await response.json();
    //carros = JSON.parse());
    let carrosJson = {};


    for (m = 0; m < carros.length; m++) {
      if (carros[m].vehicle.model.slug.includes(modeloDigitado)) {
        carrosJson = carros[m];
        m = carros.length; //para sair do for
      }
    }

    const nomeCarro = carrosJson.vehicle.model.title[0] + carrosJson.vehicle.model.title.substr(1).toLocaleLowerCase();
    const descricao = titleize(carrosJson.vehicle.specification);

    const imgTemp = carrosJson.vehicle.model.gallery[0].url;

    const franqPlanPar = carrosJson.packages[0];


    /*for(c = 0 ; c < franqPlanPar.length ; c++){
      if (franqPlanPar.period == '36')
    }*/

    const franquia = 'Franquia de ' + franqPlanPar.mileage.toString().substr(0, 2) + '.' + franqPlanPar.mileage.toString().substr(2, 5) + ' km ';
    const plano = 'Plano de ' + franqPlanPar.months + ' meses';


    const parcelas = 'A partir de ' + franqPlanPar.cost.formattedValue + '/mês';
    const condicoes = '';
    const empresa = "Porto Seguro Carro Facil";
    const link = 'https://www.portosegurocarrofacil.com.br/veiculos/' + carrosJson.vehicle.slug;


    carroEscolhido = {
      nome: nomeCarro,
      descricao: descricao,
      img: imgTemp,
      franquia: franquia,
      plano: plano,
      parcelas: parcelas,
      condicoes: condicoes,
      empresa: empresa,
      link: link
    };
  } catch (e) {
    console.log(e);
    carroEscolhido = {};
  }

  res.send(carroEscolhido)
});


app.listen(3000);