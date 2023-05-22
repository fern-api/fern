import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deploy from "@aws-cdk/aws-s3-deployment";
import * as cdk from "@aws-cdk/core";
import { FernFernCloud } from "@fern-fern/fern-cloud-sdk";

export class CdkStack extends cdk.Stack {
    constructor({
        scope,
        id,
        stackProps,
        distDirectory,
        environmentConfig,
    }: {
        scope: cdk.App;
        id: string;
        stackProps: cdk.StackProps;
        distDirectory: string;
        environmentConfig: FernFernCloud.EnvironmentInfo;
    }) {
        super(scope, id, stackProps);

        const docsFeBucket = s3.Bucket.fromBucketName(this, "docs-fe", environmentConfig.docsS3BucketName);
        new s3Deploy.BucketDeployment(this, "deploy", {
            sources: [s3Deploy.Source.asset(distDirectory)],
            destinationBucket: docsFeBucket,
        });
    }
}
