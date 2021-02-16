const questions = require('./questions.json');
const inquirer = require('inquirer');
const fs = require('fs');

const questionNames = questions.map(q => q.name)

async function createNewSnsTopic(context){
    const { amplify } = context;
    const inputs = questions.template.inputs;
    let index = questionNames.indexOf('snsDisplayName')
    let input = inputs[index]
    let questions = [
        {
          type: input.type,
          name: 'snsDisplayName',
          message: input.question,
          validate: amplify.inputValidation(input),
          default: input.default,
    }];

    let index = questionNames.indexOf('snsTopicName')
    let input = inputs[index]
    questions = [
        ...questions,
        {
          type: input.type,
          name: input.name,
          message: input.question,
          validate: amplify.inputValidation(input),
          default: input.default,
    }];
    return await inquirer.prompt(questions); 
}



async function getLambdaDetails(context){
    const { amplify } = context;
    const inputs = questions.template.inputs;
    let index = questionNames.indexOf('addConsumerLambda')
    let input = inputs[index]    
    const questions = [
        {
          type: inputs.type,
          name: 'addConsumerLambda',
          message: inputs.question,
          validate: amplify.inputValidation(input),
          default: 'consumer',
    }];
    let answers = await inquirer.prompt(questions);
    let { addConsumerLambda } = answers

    if (!addConsumerLambda) {
        return {
            addConsumerLambda,
        }
    }

    let index = questionNames.indexOf('lambdaName')
    let input = inputs[index]    
    const lambdaQ = {
          type: inputs.type,
          name: 'lambdaName',
          message: inputs.question,
          validate: amplify.inputValidation(input),
          default: 'consumer',
    };
    
    let index = questionNames.indexOf('runtime')
    let input = inputs[index]    
    const runtimeQ = {
          type: inputs.type,
          name: 'runtime',
          message: inputs.question,
          validate: amplify.inputValidation(input),
          default: 'nodejs12.x',
    };

    const questions = [lambdaQ, runtimeQ]    

    answers = await inquirer.prompt(questions);
    return {
        ...answers,
        addConsumerLambda
    };
}

async function generateQuestions(context, rootTemplate){
    const { amplify } = context;
    let questions = []

    Object.keys(rootTemplate.Parameters).forEach(key => {
        if (key === "env") return;
        let question = {};
        let param = rootTemplate.Parameters[key];
        question.name = key;
        question.message = `${param.Description}`;
        question.default = (param.Default != undefined) ? param.Default : "";
        if (param.Type === "String" && param.AllowedPattern != undefined){
            let regex = param.AllowedPattern;
            question.type = "input";
            question.validation = {};
            question.validation.operator = "regex";
            
            let lengthRegex = "";
            if (param.MinLength != undefined || param.MaxLength != undefined ){
                lengthRegex = ((param.MinLength != undefined) ? `{${param.MinLength},` : "{,") + ((param.MaxLength != undefined) ? `${param.MaxLength}}` : "}");
                if (param.MaxLength == param.MinLength){
                    lengthRegex = `{${param.MaxLength}}`
                }
                if (regex[regex.length-1] === '*'){
                     regex = regex.slice(0,-1);
                }
            }
            question.validation.value = `^${regex}` + ((lengthRegex != "") ? lengthRegex : "") + "$";
            question.validation.onErrorMesg = param.ConstraintDescription;
            question.validate = amplify.inputValidation(question);
            questions.push(question);
        } else if ((param.Type === "String" || param.Type === "Number") && param.AllowedValues != undefined){
            question.type = "list";
            question.choices = param.AllowedValues;
            questions.push(question);
        } else if (param.Type === "Number"){
            question.type = "number";
            question.validation = {};
            question.validation.operator = "range";
            question.validation.value = {};
            question.validation.value.min = ((param.MinValue != undefined) ? param.MinValue : Number.NEGATIVE_INFINITY);
            question.validation.value.max = ((param.MaxValue != undefined) ? param.MaxValue : Number.POSITIVE_INFINITY);
            question.validation.onErrorMesg = param.ConstraintDescription;
            question.validate = amplify.inputValidation(question);
            questions.push(question);
        } else {
            //Ignore and keep default :)
        }
        
    });

    const answers = await inquirer.prompt(questions);

    Object.keys(answers).forEach(key => {
        rootTemplate.Parameters[key].Default = answers[key];
    });
    return rootTemplate;
}

module.exports = {
    generateQuestions,
    subscribeToExistingSnsTopic,
    createNewSnsTopic,
    getSNSProducerDetails,
    getSNSConsumerDetails,
    getConsumerPolicyDetails,
    getProducerPolicyDetails,
    getLambdaDetails
}