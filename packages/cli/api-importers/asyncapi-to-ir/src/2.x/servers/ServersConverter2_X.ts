import { SingleBaseUrlEnvironment } from "@fern-api/ir-sdk";

import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext.js";
import { AbstractServerConverter } from "../../converters/AbstractServerConverter.js";
import { ServerV2 } from "../types.js";

export class ServersConverter2_X extends AbstractServerConverter<ServerV2> {
    constructor({ context, breadcrumbs, servers }: AbstractServerConverter.Args<ServerV2>) {
        super({ context, breadcrumbs, servers });
    }

    public buildSingleBaseUrlEnvironment(
        context: AsyncAPIConverterContext,
        serverId: string,
        server: ServerV2
    ): SingleBaseUrlEnvironment {
        return {
            id: serverId,
            name: context.casingsGenerator.generateName(serverId),
            url: this.constructServerUrl(server.protocol, server.url),
            docs: undefined,
            defaultUrl: undefined,
            urlTemplate: undefined,
            urlVariables: undefined
        };
    }
}
