import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { ContainerClient } from "../resources/container/client/Client.mjs";
import { ContentTypeClient } from "../resources/contentType/client/Client.mjs";
import { EnumClient } from "../resources/enum/client/Client.mjs";
import { HttpMethodsClient } from "../resources/httpMethods/client/Client.mjs";
import { ObjectClient } from "../resources/object/client/Client.mjs";
import { ParamsClient } from "../resources/params/client/Client.mjs";
import { PrimitiveClient } from "../resources/primitive/client/Client.mjs";
import { PutClient } from "../resources/put/client/Client.mjs";
import { UnionClient } from "../resources/union/client/Client.mjs";
import { UrlsClient } from "../resources/urls/client/Client.mjs";
export declare namespace EndpointsClient {
    interface Options extends BaseClientOptions {
    }
}
export declare class EndpointsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsClient.Options>;
    protected _container: ContainerClient | undefined;
    protected _contentType: ContentTypeClient | undefined;
    protected _enum: EnumClient | undefined;
    protected _httpMethods: HttpMethodsClient | undefined;
    protected _object: ObjectClient | undefined;
    protected _params: ParamsClient | undefined;
    protected _primitive: PrimitiveClient | undefined;
    protected _put: PutClient | undefined;
    protected _union: UnionClient | undefined;
    protected _urls: UrlsClient | undefined;
    constructor(options: EndpointsClient.Options);
    get container(): ContainerClient;
    get contentType(): ContentTypeClient;
    get enum(): EnumClient;
    get httpMethods(): HttpMethodsClient;
    get object(): ObjectClient;
    get params(): ParamsClient;
    get primitive(): PrimitiveClient;
    get put(): PutClient;
    get union(): UnionClient;
    get urls(): UrlsClient;
}
