import type { BaseClientOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import { ContainerClient } from "../resources/container/client/Client.mjs";
import { ContentTypeClient } from "../resources/contentType/client/Client.mjs";
import { DuplicateNamesAClient } from "../resources/duplicateNamesA/client/Client.mjs";
import { DuplicateNamesBClient } from "../resources/duplicateNamesB/client/Client.mjs";
import { DuplicateNamesCClient } from "../resources/duplicateNamesC/client/Client.mjs";
import { EnumClient } from "../resources/enum/client/Client.mjs";
import { ObjectClient } from "../resources/object/client/Client.mjs";
import { PaginationClient } from "../resources/pagination/client/Client.mjs";
import { ParamsClient } from "../resources/params/client/Client.mjs";
import { PrimitiveClient } from "../resources/primitive/client/Client.mjs";
import { PutClient } from "../resources/put/client/Client.mjs";
import { UnionClient } from "../resources/union/client/Client.mjs";
export declare namespace EndpointsClient {
    type Options = BaseClientOptions;
}
export declare class EndpointsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsClient.Options>;
    protected _container: ContainerClient | undefined;
    protected _contentType: ContentTypeClient | undefined;
    protected _duplicateNamesA: DuplicateNamesAClient | undefined;
    protected _duplicateNamesB: DuplicateNamesBClient | undefined;
    protected _duplicateNamesC: DuplicateNamesCClient | undefined;
    protected _enum: EnumClient | undefined;
    protected _object: ObjectClient | undefined;
    protected _pagination: PaginationClient | undefined;
    protected _params: ParamsClient | undefined;
    protected _primitive: PrimitiveClient | undefined;
    protected _put: PutClient | undefined;
    protected _union: UnionClient | undefined;
    constructor(options: EndpointsClient.Options);
    get container(): ContainerClient;
    get contentType(): ContentTypeClient;
    get duplicateNamesA(): DuplicateNamesAClient;
    get duplicateNamesB(): DuplicateNamesBClient;
    get duplicateNamesC(): DuplicateNamesCClient;
    get enum(): EnumClient;
    get object(): ObjectClient;
    get pagination(): PaginationClient;
    get params(): ParamsClient;
    get primitive(): PrimitiveClient;
    get put(): PutClient;
    get union(): UnionClient;
}
