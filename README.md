# Amplify SNS trigger with lambda template

<p>
  <a href="https://www.npmjs.com/package/amplify-sns-lambda-template">
      <img src="https://img.shields.io/npm/v/amplify-sns-lambda-template.svg" />
  </a>
</p>

An easy way to add CloudFormation SNS trigger lambda templates to your Amplify Project.

Based on Medium article: [Subscribe an AWS Lambda function to an SNS Topic in CloudFormation](https://medium.com/build-succeeded/subscribe-an-aws-lambda-function-to-an-sns-topic-in-cloudformation-and-work-6997a0f0b59b
)

## Installation

This plugin assumes that the Amplify CLI is already installed. For installation help, please see step 2 of the [getting-started docs](https://aws-amplify.github.io/docs/).

To install, simply enter the following command in your terminal:

`npm i -g amplify-sns-lambda-template`

## Usage

| Command                      | Description |
| ---------------------------- | ----------- |
| `amplify add sns-function`       | Adds an SNS trigger template to your project. |
| `amplify remove sns-function`    | Removes a specified SNS trigger template from your project. |

## Usage notes

Note that you can apply this template on an existing function generated via amplify.

The resource will assume the function codes can be found in `./src` relative to the template, such as in `./src/index.js` for nodejs lambda code.

## What it does

- Creates an SNS Topic
- Creates a Lambda Function
- Allows the SNS Topic to call the Lambda Function
- Allow set of resources (by default all) in your AWS Account to send a message to the SNS topic

## Questions

## SNS Display Name

The display name (in AWS Console and such) for the SNS topic. Can be any string.

## SNS Topic Name

The logical name of the SNS topic (programatic identifier). Must be alphanumerical (`[a-zA-Z0-9]`)

### Name for your lambda function

The logical name of the lambda function triggered by SNS messages (programatic identifier). Must be alphanumerical without dashes or underscores (`[a-zA-Z0-9]`)

### Source ARN for your policy

The source ARN for which your policy applies. By default `*` (all resources) which should only be used for development/testing as this allows any AWS resource to send a message to the SNS topic.

In practice you should limit this to apply to one or more lambdas, SQS queues or similar resources.

### Runtime

[Lambda runtime values](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html)

```txt
dotnetcore1.0 | dotnetcore2.0 | dotnetcore2.1 | dotnetcore3.1 | go1.x | java11 | java8 | java8.al2 | nodejs | nodejs10.x | nodejs12.x | nodejs4.3 | nodejs4.3-edge | nodejs6.10 | nodejs8.10 | provided | provided.al2 | python2.7 | python3.6 | python3.7 | python3.8 | ruby2.5 | ruby2.7
```

Currently the CLI only supports the following values:

- `nodejs12.x`
- `python3.8`
- `python3.7`
- `python2.7`

You can manually edit the generated template, searching for runtime and substitute as needed.

### Timeout

You can specify the timeout for the lambda. The default is `60` for 60 seconds (1 minute)
