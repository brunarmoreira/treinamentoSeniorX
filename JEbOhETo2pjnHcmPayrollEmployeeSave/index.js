
/**
 * Nome da primitiva : employeeSave
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn35185957
 **/

const axios = require('axios');

exports.handler = async event => {

    let body = parseBody(event);
    let tokenSeniorX = event.headers['X-Senior-Token'];

    const instance = axios.create({
        baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
        headers: {
          'Authorization': tokenSeniorX
        }
    });
    
    //Obriga informar matricula do colaborador
    if(!body.sheetContract.registernumber){
        return sendRes(400,'A matrícula do colaborador deve ser informada.');
    }
    
    //Valida se Indicativo de Admissão é igual a NORMAL
    if(body.sheetContract.admissionOriginType.key !== "NORMAL") {
        return sendRes(400,'Somente é possível realizar admissão com Indicativo igual à NORMAL.');
    }
    
    //Não permite alterar nome do colaborador
    if(body.sheetInitial.employee) {
        let employee = await instance.get(`/hcm/payroll/entities/employee/${body.sheetInitial.employee.tableId}`);
        
        //Separa nome e sobrenome
        let nome = body.sheetInitial.person.name;
        let arraynome = nome.split(" ");
        nome = arraynome[0];
        
        //Compara somente primeiro nome
        if(employee.data.person.firstname !== nome){
            return sendRes(400,'Não é permitido alterar o nome do colaborador.'); 
        }
    }
    
    //Para Empregado permite somente escala de 1 a 10 e do tipo permanente
    if((body.sheetInitial.contractType.key === 'Employee') && (body.sheetWorkSchedule.workshift.tableId)){
        let escala = await instance.get(`/hcm/payroll/entities/workshift/${body.sheetWorkSchedule.workshift.tableId}`);
            
        if((escala.data.code > 10) || (escala.data.workshiftType !== 'Permanent')) {
            return sendRes(400,'Escala não permitida para Empregado. Escala deve ser menor ou igual a 10 e do tipo PERMANENTE');
        }
    }
    
    return sendRes(200,body);
};

const parseBody = (event) => {
    return typeof event.body === 'string' ?  JSON.parse(event.body) : event.body || {};
};

const sendRes = (status, body) => {
    var response = {
      statusCode: status,
      headers: {
        "Content-Type": "application/json"
      },
      body: typeof body === 'string' ? body : JSON.stringify(body) 
    };
    return response;
};