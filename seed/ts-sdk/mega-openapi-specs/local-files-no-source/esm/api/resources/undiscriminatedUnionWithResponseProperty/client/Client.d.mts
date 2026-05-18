import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UndiscriminatedUnionWithResponsePropertyClient as UndiscriminatedUnionWithResponsePropertyClient_ } from "../resources/undiscriminatedUnionWithResponseProperty/client/Client.mjs";
export declare namespace UndiscriminatedUnionWithResponsePropertyClient {
    type Options = BaseClientOptions;
}
export declare class UndiscriminatedUnionWithResponsePropertyClient {
    protected readonly _options: NormalizedClientOptions<UndiscriminatedUnionWithResponsePropertyClient.Options>;
    protected _undiscriminatedUnionWithResponseProperty: UndiscriminatedUnionWithResponsePropertyClient_ | undefined;
    constructor(options: UndiscriminatedUnionWithResponsePropertyClient.Options);
    get undiscriminatedUnionWithResponseProperty(): UndiscriminatedUnionWithResponsePropertyClient_;
}
