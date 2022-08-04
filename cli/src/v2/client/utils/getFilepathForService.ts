import { ServiceName } from "@fern-fern/ir-model/services";
import path from "path";
import { getFileNameForService } from "./getFileNameForService";
import { getFilepathForFernFilepath } from "./getFilepathForFernFilepath";

export function getFilepathForService(serviceName: ServiceName): string {
    return path.join(getFilepathForFernFilepath(serviceName.fernFilepath), getFileNameForService(serviceName));
}
