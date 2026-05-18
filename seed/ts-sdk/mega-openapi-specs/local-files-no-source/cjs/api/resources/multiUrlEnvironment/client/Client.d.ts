import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { Ec2Client } from "../resources/ec2/client/Client.js";
import { S3Client } from "../resources/s3/client/Client.js";
export declare namespace MultiUrlEnvironmentClient {
    type Options = BaseClientOptions;
}
export declare class MultiUrlEnvironmentClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<MultiUrlEnvironmentClient.Options>;
    protected _ec2: Ec2Client | undefined;
    protected _s3: S3Client | undefined;
    constructor(options: MultiUrlEnvironmentClient.Options);
    get ec2(): Ec2Client;
    get s3(): S3Client;
}
