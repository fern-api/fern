import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { Container } from "../resources/container/client/Client.mjs";
import { ContentType } from "../resources/contentType/client/Client.mjs";
import { Enum } from "../resources/enum/client/Client.mjs";
import { HttpMethods } from "../resources/httpMethods/client/Client.mjs";
import { Object_ } from "../resources/object/client/Client.mjs";
import { Params } from "../resources/params/client/Client.mjs";
import { Primitive } from "../resources/primitive/client/Client.mjs";
import { Put } from "../resources/put/client/Client.mjs";
import { Union } from "../resources/union/client/Client.mjs";
import { Urls } from "../resources/urls/client/Client.mjs";
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
