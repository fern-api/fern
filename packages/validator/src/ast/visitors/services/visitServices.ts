import { ServicesSchema } from "@fern-api/yaml-schema/src/schemas";
import { FernAstVisitor } from "../../AstVisitor";
import { noop } from "../utils/noop";
import { visitObject } from "../utils/ObjectPropertiesVisitor";
import { visitHttpService } from "./visitHttpService";

export function visitServices(services: ServicesSchema | undefined, visitor: FernAstVisitor): void {
    if (services == null) {
        return;
    }
    visitObject(services, {
        http: (httpServices) => {
            if (httpServices == null) {
                return;
            }
            for (const [httpServiceName, httpService] of Object.entries(httpServices)) {
                visitor.httpService({ serviceName: httpServiceName, service: httpService });
                visitHttpService({ service: httpService, visitor });
            }
        },
        websocket: noop,
    });
}
