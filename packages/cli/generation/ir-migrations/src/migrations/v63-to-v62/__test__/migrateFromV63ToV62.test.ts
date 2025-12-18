import { createMockTaskContext } from "@fern-api/task-context";

import { IrVersions } from "../../../ir-versions";
import { V63_TO_V62_MIGRATION } from "../migrateFromV63ToV62";

describe("migrateFromV63ToV62", () => {
    it("converts ENDPOINT_SECURITY auth requirement to ALL", () => {
        const v63IR: Partial<IrVersions.V63.IntermediateRepresentation> = {
            auth: {
                docs: undefined,
                requirement: IrVersions.V63.AuthSchemesRequirement.EndpointSecurity,
                schemes: []
            }
        };

        const migratedIR = V63_TO_V62_MIGRATION.migrateBackwards(v63IR as IrVersions.V63.IntermediateRepresentation, {
            taskContext: createMockTaskContext(),
            targetGenerator: {
                name: "test-generator",
                version: "0.0.0"
            }
        });

        // ENDPOINT_SECURITY should be converted to ALL
        expect(migratedIR.auth.requirement).toBe(IrVersions.V62.AuthSchemesRequirement.All);
    });

    it("preserves ALL auth requirement", () => {
        const v63IR: Partial<IrVersions.V63.IntermediateRepresentation> = {
            auth: {
                docs: undefined,
                requirement: IrVersions.V63.AuthSchemesRequirement.All,
                schemes: []
            }
        };

        const migratedIR = V63_TO_V62_MIGRATION.migrateBackwards(v63IR as IrVersions.V63.IntermediateRepresentation, {
            taskContext: createMockTaskContext(),
            targetGenerator: {
                name: "test-generator",
                version: "0.0.0"
            }
        });

        // ALL should remain ALL
        expect(migratedIR.auth.requirement).toBe(IrVersions.V62.AuthSchemesRequirement.All);
    });

    it("preserves ANY auth requirement", () => {
        const v63IR: Partial<IrVersions.V63.IntermediateRepresentation> = {
            auth: {
                docs: undefined,
                requirement: IrVersions.V63.AuthSchemesRequirement.Any,
                schemes: []
            }
        };

        const migratedIR = V63_TO_V62_MIGRATION.migrateBackwards(v63IR as IrVersions.V63.IntermediateRepresentation, {
            taskContext: createMockTaskContext(),
            targetGenerator: {
                name: "test-generator",
                version: "0.0.0"
            }
        });

        // ANY should remain ANY
        expect(migratedIR.auth.requirement).toBe(IrVersions.V62.AuthSchemesRequirement.Any);
    });
});
