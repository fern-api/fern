import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { SimpleFhirClient as SimpleFhirClient_ } from "../resources/simpleFhir/client/Client.mjs";
export declare namespace SimpleFhirClient {
    type Options = BaseClientOptions;
}
export declare class SimpleFhirClient {
    protected readonly _options: NormalizedClientOptions<SimpleFhirClient.Options>;
    protected _simpleFhir: SimpleFhirClient_ | undefined;
    constructor(options: SimpleFhirClient.Options);
    get simpleFhir(): SimpleFhirClient_;
}
