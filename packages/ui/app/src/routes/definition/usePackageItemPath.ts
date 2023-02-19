import { generatePath, useParams } from "react-router-dom";
import { PackagePath } from "../../commons/PackagePath";
import { API_DEFINITION, API_DEFINITION_PACKAGE } from "../routes";

export function usePackageItemPath(packagePath: PackagePath, namespace: string, itemName: string): string {
    const {
        [API_DEFINITION.parameters.API_ID]: apiIdParam,
        [API_DEFINITION.parameters.ENVIRONMENT_ID]: environmentIdParam,
    } = useParams();

    if (apiIdParam == null) {
        throw new Error("API ID is not defined");
    }
    if (environmentIdParam == null) {
        throw new Error("Environment ID is not defined");
    }

    return generatePath(API_DEFINITION_PACKAGE.absolutePath, {
        API_ID: apiIdParam,
        ENVIRONMENT_ID: environmentIdParam,
        "*": [...packagePath, namespace, itemName].map(encodeURI).join("/"),
    });
}
