import { GeneratorName } from "@fern-api/generators-configuration";
import { mapValues } from "lodash-es";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V10_TO_V9_MIGRATION: IrMigration<
    IrVersions.V10.ir.IntermediateRepresentation,
    IrVersions.V9.ir.IntermediateRepresentation
> = {
    laterVersion: "v10",
    earlierVersion: "v9",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_EXPRESS]: AlwaysRunMigration,
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.STOPLIGHT]: undefined,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
        [GeneratorName.PYTHON_SDK]: undefined,
        [GeneratorName.GO_MODEL]: AlwaysRunMigration,
    },
    migrateBackwards: (v10): IrVersions.V9.ir.IntermediateRepresentation => {
        const v9Services: Record<IrVersions.V9.commons.ServiceId, IrVersions.V9.http.HttpService> = mapValues(
            v10.services,
            (service) => ({
                docs: undefined,
                ...service,
            })
        );

        for (const subpackage of Object.values(v10.subpackages)) {
            if (subpackage.docs != null && subpackage.service != null) {
                const service = v9Services[subpackage.service];
                if (service == null) {
                    throw new Error("Service does not exist: " + subpackage.service);
                }
                service.docs = subpackage.docs;
            }
        }

        return {
            ...v10,
            services: v9Services,
        };
    },
};
