import { RawSchemas } from "@fern-api/yaml-schema";
import { Environment } from "@fern-fern/ir-model/environment";
import { CasingsGenerator } from "../casings/CasingsGenerator";

export function convertEnvironments({
    rawApiFileSchema,
    casingsGenerator,
}: {
    rawApiFileSchema: RawSchemas.RootApiFileSchema;
    casingsGenerator: CasingsGenerator;
}): Environment[] {
    if (rawApiFileSchema.environments == null) {
        return [];
    }
    const environments: Environment[] = [];
    for (const [environmentId, environment] of rawApiFileSchema.environments) {
        if (typeof environment === "string") {
            environments.push({
                id: environmentId,
                name: casingsGenerator.generateName(environmentId),
                url: environment,
                docs: undefined,
            });
        } else {
            environments.push({
                id: environmentId,
                name: casingsGenerator.generateName(environmentId),
                url: environment.url,
                docs: environment.docs,
            });
        }
    }
    return environments;
}
