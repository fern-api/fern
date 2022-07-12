import { ServicesSchema } from "../../../schemas";
import { FernAstVisitor } from "../../FernAstVisitor";
import { NodePath } from "../../NodePath";
import { noop } from "../utils/noop";
import { visitObject } from "../utils/ObjectPropertiesVisitor";
import { visitHttpService } from "./visitHttpService";

export function visitServices({
    services,
    visitor,
    nodePath,
}: {
    services: ServicesSchema | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): void {
    if (services == null) {
        return;
    }
    visitObject(services, {
        http: (httpServices) => {
            if (httpServices == null) {
                return;
            }
            for (const [httpServiceName, httpService] of Object.entries(httpServices)) {
                const nodePathForService = [...nodePath, "http", httpServiceName];
                visitor.httpService?.({ serviceName: httpServiceName, service: httpService }, nodePathForService);
                visitHttpService({ service: httpService, visitor, nodePathForService });
            }
        },
        websocket: noop,
    });
}
