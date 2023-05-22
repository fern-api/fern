import * as acm from "@aws-cdk/aws-certificatemanager";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as route53 from "@aws-cdk/aws-route53";
import * as targets from "@aws-cdk/aws-route53-targets";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deploy from "@aws-cdk/aws-s3-deployment";
import * as cdk from "@aws-cdk/core";

const PRIMARY_DOMAIN_REGEX = /.*(\.|^)(.*\..*)/;

export class CdkStack extends cdk.Stack {
    constructor({
        scope,
        id,
        stackProps,
        distDirectory,
        domain,
    }: {
        scope: cdk.App;
        id: string;
        stackProps: cdk.StackProps;
        distDirectory: string;
        domain: string;
    }) {
        super(scope, id, stackProps);

        // e.g. google.com
        const primaryDomain = domain.match(PRIMARY_DOMAIN_REGEX)?.[2];
        if (primaryDomain == null) {
            throw new Error("Could not parse primary domain from specific domain: " + domain);
        }
        // e.g. *.google.com
        const subDomain = `*.${primaryDomain}`;

        const bucket = new s3.Bucket(this, "bucket", {
            websiteIndexDocument: "index.html",
            bucketName: domain,
        });

        const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, "OIA");
        bucket.grantRead(originAccessIdentity);

        const zone = route53.HostedZone.fromLookup(this, "zone", {
            domainName: primaryDomain,
        });

        const myCertificate = new acm.DnsValidatedCertificate(this, "certificate", {
            domainName: primaryDomain,
            subjectAlternativeNames: [subDomain, `*.${domain}`],
            hostedZone: zone,
        });

        const distribution = new cloudfront.CloudFrontWebDistribution(this, "distribution", {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: bucket,
                        originAccessIdentity,
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
            errorConfigurations: [
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: "/index.html",
                },
            ],
            viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(myCertificate, {
                aliases: [`www.${domain}`, domain],
            }),
        });

        new route53.ARecord(this, "AliasRecord", {
            zone,
            recordName: subDomain,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        });

        new s3Deploy.BucketDeployment(this, "deploy", {
            sources: [s3Deploy.Source.asset(distDirectory)],
            destinationBucket: bucket,
            distribution,
        });
    }
}
