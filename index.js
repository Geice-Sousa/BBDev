import fs from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';

operation();

// escolha da operação
function operation(){

  inquirer.prompt([
    { type: 'list',
      name: 'action',
      message: 'O que você deseja?',
      choices: ['Criar conta', 'Consultar saldo', 'Depositar', 'Sacar', 'Sair'],
    },
  ]).then((response)=>{
    
    const action = response['action'];
    switch(action){

      case 'Criar conta':
        createAccount();
        break;

      case 'Consultar saldo': 
        getAccountBalance();
        break;

      case 'Depositar': 
        deposit();
        break;

      case 'Sacar': 
        withdraw();
        break;

      case 'Sair':
        console.log(chalk.bold.italic('Obrigado por usar o BBDev, até breve!'));
        //process.exit(); // encerra a execução do programa
        break;

      default: console.log(`É necessário escolher um opção`);
    }
  })
  .catch((error)=> console.log(error));
}

// criação de conta
function createAccount(){

  console.log(chalk.magentaBright.bold(`Te desejamos boas-vindas! Parabéns por escolher o nosso banco!`));
  console.log(chalk.yellowBright(`A seguir defina as opções de sua conta.`)); // obs.: usar o chalk

  buildAccount();
}

function buildAccount(){

  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Crie um nome para sua conta:'
    },
  ]).then((response)=>{

    const accountName = response['accountName'];

    if(!fs.existsSync('accounts')){
      fs.mkdirSync('accounts'); // verifica se o diretorio não existe e cria um
    }
    if(fs.existsSync(`accounts/${accountName}.json`)){ // verifica se há uma conta com esse nome no diretório, cada conta é um arqv json
      
      console.log(chalk.red('Já existe uma conta com esse nome, por favor, escolha outro!'));
      
      buildAccount();
      return
    }

    fs.writeFileSync(`accounts/${accountName}.json`, '{ "balance": 0 }', (error)=> console.log(error)); 

    console.log(chalk.greenBright.bold('Parabéns! Sua conta foi criada.'));
    
    operation()


  }).catch((error)=> console.log(error));

}

// faz um deposito
function deposit(){

  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Qual o nome da sua conta?'
    }
  ]).then((response)=>{
    
    const accountName = response['accountName']

    if(!checkAccount(accountName)){
      return deposit(); // volta ara digitar o nome da conta
    }

    inquirer.prompt([
      {
        name:'amount',
        message: 'Qual valor será depositado?'
      }
    ]).then((response)=>{

      const amount = response['amount'];
      // adc quantia 

      addAmount(accountName, amount)
      operation();


    }).catch((error)=> console.log(error));


  }).catch((error)=> console.log(error));
}

// mostra o saldo
function getAccountBalance(){
  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Qual o nome da sua conta?'
    }
  ]).then((response)=>{
    const accountName = response['accountName'];

    if(!checkAccount(accountName)){
      return getAccountBalance();
    }

    const accountData = getAccount(accountName);

    console.log(chalk.yellow(`O saldo de sua conta é R$${accountData.balance}.`));

  }).catch((error)=> console.log(error))
}

function withdraw(){

  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Qual o nome da sua conta?'
    }
  ]).then((response)=>{
    const accountName = response['accountName'];

    if(!checkAccount(accountName)){
      return withdraw();
    }

    inquirer.prompt([
      {
        name: 'amount',
        message: 'Qual o valor do saque?'
      }
    ]).then((response)=>{
      const amount = response['amount']

      removeAmount(accountName, amount);

    }).catch((error)=>console.log(error));

  }).catch((error)=> console.log(error))
}


// ----- funções gerais -----

//verifica se a conta existe
function checkAccount(accountName){

  if(!fs.existsSync(`accounts/${accountName}.json`)){
    console.log(chalk.bold('Essa conta não existe, verifique o nome'));
    return false;
  }

  return true;
}

// adc quantia
function addAmount(accountName, amount){

  const accountData = getAccount(accountName);

  if(!amount){
    console.log(chalk.red.bold('Você precisa informar um valor para realizar o depósito.'))

    return deposit();
  }
  console.log(accountData)

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance); // soma o valor que já tinha com o novo

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData)), (error)=>{
    console.log(error)
  }

  console.log(chalk.yellow(`O valor de R$${amount} foi depositado com sucesso!`));
}

// remove quantia
function removeAmount(accountName, amount){
  const accountData = getAccount(accountName);

  if(!amount){
    console.log(chalk.red.bold('Você precisa informar um valor para sacar.'));
    return withdraw();
  }
  if(accountData.balance < amount){
    console.log(chalk.gray.bold('Valor indisponível'));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount) ; // soma o valor que já tinha com o novo

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData)), (error)=>{
    console.log(error)
  }

  console.log(chalk.yellow(`O valor de R$${amount} foi sacado de sua conta.`));

}

// verifica/pega a conta
function getAccount(accountName){
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, { 
    encoding: 'utf-8',
    flag: 'r' // sinalizador do sistema, tbm pode se um nº; r diz que o arquivo é somente para leitura
  });

  return JSON.parse(accountJSON);
}