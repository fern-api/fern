import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { Ec2Client } from "../resources/ec2/client/Client.mjs";
import { S3Client } from "../resources/s3/client/Client.mjs";
export declare namespace MultiUrlEnvironmentNoDefaultClient {
    type Options = BaseClientOptions;
}
export declare class MultiUrlEnvironmentNoDefaultClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<MultiUrlEnvironmentNoDefaultClient.Options>;
    protected _ec2: Ec2Client | undefined;
    protected _s3: S3Client | undefined;
    constructor(options: MultiUrlEnvironmentNoDefaultClient.Options);
    get ec2(): Ec2Client;
    get s3(): S3Client;
}
