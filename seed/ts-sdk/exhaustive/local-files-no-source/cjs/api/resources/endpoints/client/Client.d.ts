import type { BaseClientOptions } from "../../../../BaseClient.js";
import { Container } from "../resources/container/client/Client.js";
import { ContentType } from "../resources/contentType/client/Client.js";
import { Enum } from "../resources/enum/client/Client.js";
import { HttpMethods } from "../resources/httpMethods/client/Client.js";
import { Object_ } from "../resources/object/client/Client.js";
import { Params } from "../resources/params/client/Client.js";
import { Primitive } from "../resources/primitive/client/Client.js";
import { Put } from "../resources/put/client/Client.js";
import { Union } from "../resources/union/client/Client.js";
import { Urls } from "../resources/urls/client/Client.js";
export declare namespace Endpoints {
    interface Options extends BaseClientOptions {
    }
}
export declare class Endpoints {
    protected readonly _options: Endpoints.Options;
    protected _container: Container | undefined;
    protected _contentType: ContentType | undefined;
    protected _enum: Enum | undefined;
    protected _httpMethods: HttpMethods | undefined;
    protected _object: Object_ | undefined;
    protected _params: Params | undefined;
    protected _primitive: Primitive | undefined;
    protected _put: Put | undefined;
    protected _union: Union | undefined;
    protected _urls: Urls | undefined;
    constructor(_options: Endpoints.Options);
    get container(): Container;
    get contentType(): ContentType;
    get enum(): Enum;
    get httpMethods(): HttpMethods;
    get object(): Object_;
    get params(): Params;
    get primitive(): Primitive;
    get put(): Put;
    get union(): Union;
    get urls(): Urls;
}
