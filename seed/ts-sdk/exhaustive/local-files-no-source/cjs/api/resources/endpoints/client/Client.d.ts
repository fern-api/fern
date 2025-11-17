import type { BaseClientOptions } from "../../../../BaseClient.js";
import { ContainerClient } from "../resources/container/client/Client.js";
import { ContentTypeClient } from "../resources/contentType/client/Client.js";
import { EnumClient } from "../resources/enum/client/Client.js";
import { HttpMethodsClient } from "../resources/httpMethods/client/Client.js";
import { ObjectClient } from "../resources/object/client/Client.js";
import { ParamsClient } from "../resources/params/client/Client.js";
import { PrimitiveClient } from "../resources/primitive/client/Client.js";
import { PutClient } from "../resources/put/client/Client.js";
import { UnionClient } from "../resources/union/client/Client.js";
import { UrlsClient } from "../resources/urls/client/Client.js";
export declare namespace EndpointsClient {
    interface Options extends BaseClientOptions {
    }
}
export declare class EndpointsClient {
    protected readonly _options: EndpointsClient.Options;
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
