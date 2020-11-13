
/**
 * Nome da primitiva : createMergeHistoricalSalary
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn35185957
 **/

const axios = require('axios');
const moment = require('moment');

exports.handler = async event => {

    let body = parseBody(event);
    let tokenSeniorX = event.headers['X-Senior-Token'];

  const instance = axios.create({
        baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
        headers: {
          'Authorization': tokenSeniorX
        }
    });
    
  
  //Verifica se é colaborador demitido
  let employee = await instance.get(`/hcm/payroll/entities/employee/${body.employee.id}`);
  if(employee.data.DismissalDate){
    return sendRes(400,'Não é permitido incluir histórico de salário para colaboradores demitidos.');
  }
  
  //Compara data com data atual e nao permite data retroativa
  if(body.dateWhen < moment().format('YYYY-MM-DD')){
    return sendRes(400,'Não é permitido incluir históricos de salário com data retroativa.');
  }

return sendRes(200, JSON.parse(event.body));
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
