const fs = require('fs');
const path = require('path');
// const { copyFilesToS3 } = require('./helpers/template-staging');
const { 
    generateQuestions,
    createNewSnsTopic,
    getLambdaDetails 
} = require('./helpers/template-question');
const { yamlParse, yamlDump } = require('yaml-cfn');
// const { prompts } = require('inquirer');

module.exports = (context) => {
    context.createTemplate = async () => {
      await createTemplate(context);
    };
};

async function createTemplate(context){
    const options = {
        service: 'sqs',
        providerPlugin: 'awscloudformation',
    };

    let snsTopic = await createNewSnsTopic(context)
    let lambdaDetails = await getLambdaDetails(context);

    let props = {
        // snsDisplayName,, snsTopicName
        ...snsTopic,
        // addSnsConsumer, snsConsumerName
        // addConsumerLambda, lambdaName
        ...lambdaDetails
    }
    props.options = options;
    props.root = path.join(__dirname, 'templates/sns-lambda-template.json.ejs')
    prepareCloudFormation(context,props);
}

async function prepareCloudFormation(context, props){
    let split = props.root.split('.');
    let ending = split[split.length-1];
    props.ending = ending
    const endStr = ending.toLowerCase()
    if (endStr.includes('json')) {
        await handleJSON(context, props);
    } else if (endStr.includes('yaml') || endStr.includes('yml')){
        await handleYAML(context, props);
    } else {
        console.log('Error! Can\'t find ending');
    }
    await stageRoot(context, props);
}

function renderTemplate(rootTemplate, props) {
    return ejs.render(rootTemplate, props);
}

async function handleYAML(context, props){
    let rootTemplate = yamlParse(fs.readFileSync(props.root,'utf8'));
    rootTemplate = renderTemplate(rootTemplate, props)
    rootTemplate = await prepareTemplate(context, props, rootTemplate);    
    rootTemplate = await generateQuestions(context, rootTemplate);
    fs.writeFileSync(props.root, yamlDump(rootTemplate, null, 4));
}

async function handleJSON(context, props){
    let rootTemplate = JSON.parse(fs.readFileSync(props.root));
    rootTemplate = renderTemplate(rootTemplate, props)
    rootTemplate = await prepareTemplate(context, props, rootTemplate);    
    rootTemplate = await generateQuestions(context, rootTemplate);
    fs.writeFileSync(props.root, JSON.stringify(rootTemplate, null, 4));
}

async function prepareTemplate(context, props, rootTemplate){
    const { amplify } = context;

    if (!rootTemplate.Parameters){
        rootTemplate.Parameters = {}
    } 
    if (!rootTemplate.Parameters.env) {
        rootTemplate.Parameters.env = {
            Type :"String",
            Description: "The environment name. e.g. Dev, Test, or Production",
            Default: "NONE"
        }
    }
    return rootTemplate
}

async function stageRoot(context, props){
    const { amplify } = context;
    const targetDir = amplify.pathManager.getBackendDirPath();
    const copyJobs = [
        {
          dir: '/',
          template: `${props.root}`,
          target: `${targetDir}/function/${props.name}/${props.projectName}-sns-sqs-template.${props.ending}`,
        },
      ];
      context.amplify.updateamplifyMetaAfterResourceAdd(
        "sqs",
        props.name,
        props.options,
      );
      await context.amplify.copyBatch(context, copyJobs, props);      
}