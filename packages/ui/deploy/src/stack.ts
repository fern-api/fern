import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deploy from "@aws-cdk/aws-s3-deployment";
import * as cdk from "@aws-cdk/core";

export class CdkStack extends cdk.Stack {
    constructor({
        scope,
        id,
        stackProps,
        distDirectory,
        bucketName,
    }: {
        scope: cdk.App;
        id: string;
        stackProps: cdk.StackProps;
        distDirectory: string;
        bucketName: string;
    }) {
        super(scope, id, stackProps);

        const bucket = new s3.Bucket(this, "bucket", {
            websiteIndexDocument: "index.html",
            bucketName,
        });

        new s3Deploy.BucketDeployment(this, "deploy", {
            sources: [s3Deploy.Source.asset(distDirectory)],
            destinationBucket: bucket,
        });
    }
}
