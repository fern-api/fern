import { noop } from "@fern-api/core-utils";
import { ServicesSchema } from "../../../schemas";
import { FernAstVisitor } from "../../FernAstVisitor";
import { NodePath } from "../../NodePath";
import { visitObject } from "../utils/ObjectPropertiesVisitor";
import { visitHttpService } from "./visitHttpService";

export async function visitServices({
    services,
    visitor,
    nodePath,
}: {
    services: ServicesSchema | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (services == null) {
        return;
    }
    await visitObject(services, {
        http: async (httpServices) => {
            if (httpServices == null) {
                return;
            }
            for (const [httpServiceName, httpService] of Object.entries(httpServices)) {
                const nodePathForService = [...nodePath, "http", httpServiceName];
                await visitor.httpService?.({ serviceName: httpServiceName, service: httpService }, nodePathForService);
                await visitHttpService({ service: httpService, visitor, nodePathForService });
            }
        },
        websocket: noop,
    });
}
