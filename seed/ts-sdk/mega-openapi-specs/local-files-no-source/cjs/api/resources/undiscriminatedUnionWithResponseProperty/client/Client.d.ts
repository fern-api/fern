import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UndiscriminatedUnionWithResponsePropertyClient as UndiscriminatedUnionWithResponsePropertyClient_ } from "../resources/undiscriminatedUnionWithResponseProperty/client/Client.js";
export declare namespace UndiscriminatedUnionWithResponsePropertyClient {
    type Options = BaseClientOptions;
}
export declare class UndiscriminatedUnionWithResponsePropertyClient {
    protected readonly _options: NormalizedClientOptions<UndiscriminatedUnionWithResponsePropertyClient.Options>;
    protected _undiscriminatedUnionWithResponseProperty: UndiscriminatedUnionWithResponsePropertyClient_ | undefined;
    constructor(options: UndiscriminatedUnionWithResponsePropertyClient.Options);
    get undiscriminatedUnionWithResponseProperty(): UndiscriminatedUnionWithResponsePropertyClient_;
}
