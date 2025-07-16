import { SingleBaseUrlEnvironment } from "@fern-api/ir-sdk";

import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext";
import { AbstractServerConverter } from "../../converters/AbstractServerConverter";
import { ServerV3 } from "../types";

export class ServersConverter3_0 extends AbstractServerConverter<ServerV3> {
    constructor({ context, breadcrumbs, servers }: AbstractServerConverter.Args<ServerV3>) {
        super({ context, breadcrumbs, servers });
    }

    public buildSingleBaseUrlEnvironment(
        context: AsyncAPIConverterContext,
        serverId: string,
        server: ServerV3
    ): SingleBaseUrlEnvironment {
        return {
            id: serverId,
            name: context.casingsGenerator.generateName(serverId),
            url: this.constructServerUrl(server.protocol, server.host),
            docs: undefined
        };
    }
}
