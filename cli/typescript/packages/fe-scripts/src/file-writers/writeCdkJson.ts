import { createJsonFileWriter } from "./utils/createJsonFileWriter";

export const writeCdkJson = createJsonFileWriter({
    relativePath: "cdk.json",
    isForBundlesOnly: true,
    generateJson: () => ({
        app: "npx ts-node --prefer-ts-exts deploy/deploy.ts",
        context: {
            "@aws-cdk/aws-apigateway:usagePlanKeyOrderInsensitiveId": true,
            "@aws-cdk/core:stackRelativeExports": true,
            "@aws-cdk/aws-rds:lowercaseDbIdentifier": true,
            "@aws-cdk/aws-lambda:recognizeVersionProps": true,
            "@aws-cdk/aws-cloudfront:defaultSecurityPolicyTLSv1.2_2021": true,
            "@aws-cdk-containers/ecs-service-extensions:enableDefaultLogDriver": true,
            "@aws-cdk/aws-ec2:uniqueImdsv2TemplateName": true,
            "@aws-cdk/core:target-partitions": ["aws", "aws-cn"],
        },
    }),
});
