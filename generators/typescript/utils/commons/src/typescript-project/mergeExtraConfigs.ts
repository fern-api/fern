import { isArray, mergeWith } from "lodash-es";
import { IPackageJson } from "package-json-type";

export function mergeExtraConfigs(
    packageJson: IPackageJson,
    extraConfigs: Record<string, unknown> | undefined
): IPackageJson {
    function customizer(objValue: unknown, srcValue: unknown) {
        if (isArray(objValue) && isArray(srcValue)) {
            return [...new Set(srcValue.concat(objValue))];
        } else if (typeof objValue === "object" && typeof srcValue === "object") {
            return {
                ...objValue,
                ...srcValue
            };
        } else {
            return srcValue;
        }
    }
    return mergeWith(JSON.parse(JSON.stringify(packageJson)), extraConfigs ?? {}, customizer);
}
