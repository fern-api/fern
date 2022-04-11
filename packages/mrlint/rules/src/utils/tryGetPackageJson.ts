import { Logger, Package } from "@mrlint/commons";
import { IPackageJson } from "package-json-type";

export interface PackageJsonWithName extends IPackageJson {
    name: string;
}

export function tryGetPackageJson(p: Package, logger: Logger): PackageJsonWithName | undefined {
    if (p.packageJson == null) {
        logger.error({
            message: "package.json does not exist",
        });
        return undefined;
    }
    if (p.packageJson?.name == null) {
        logger.error({
            message: 'package.json is missing "name"',
        });
        return undefined;
    }

    return {
        ...p.packageJson,
        name: p.packageJson.name,
    };
}
