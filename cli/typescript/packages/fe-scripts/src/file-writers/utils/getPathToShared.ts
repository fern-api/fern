import path from "path";
import { FilePath, LernaPackage } from "../../types";

export function getPathToShared(lernaPackage: LernaPackage): FilePath {
    return path.relative(lernaPackage.location, path.join(lernaPackage.rootPath, "shared"));
}
