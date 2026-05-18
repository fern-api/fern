import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace S3Client {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class S3Client {
    protected readonly _options: NormalizedClientOptionsWithAuth<S3Client.Options>;
    constructor(options: S3Client.Options);
    /**
     * @param {SeedApi.multiUrlEnvironmentNoDefault.GetPresignedUrlS3Request} request
     * @param {S3Client.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.multiUrlEnvironmentNoDefault.s3.getPresignedUrl({
     *         s3Key: "s3Key"
     *     })
     */
    getPresignedUrl(request: SeedApi.multiUrlEnvironmentNoDefault.GetPresignedUrlS3Request, requestOptions?: S3Client.RequestOptions): core.HttpResponsePromise<string>;
    private __getPresignedUrl;
}
