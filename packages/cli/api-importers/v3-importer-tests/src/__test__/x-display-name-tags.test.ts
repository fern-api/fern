import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

async function getIRForFixture(fixtureName: string) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenAPI fixture ${fixtureName}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${fixtureName}`);
    }
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: true,
        logWarnings: false
    });
}

describe("OpenAPI tag x-displayName", () => {
    it("preserves tag display names only for tag-derived groups", async () => {
        const ir = await getIRForFixture("x-display-name-tags");

        const servicesByDisplayName = Object.fromEntries(
            Object.values(ir.services)
                .filter((service) => service.displayName != null)
                .map((service) => [service.displayName, service])
        );
        expect(Object.keys(servicesByDisplayName).sort()).toEqual([
            "BMC Credential",
            "BMC-Reset",
            "Custom Actions",
            "Fleet Operations",
            "Totally Different Label",
            "VPC Peering"
        ]);

        const subpackagesByDisplayName = Object.fromEntries(
            Object.values(ir.subpackages)
                .filter((subpackage) => subpackage.displayName != null)
                .map((subpackage) => [subpackage.displayName, subpackage])
        );
        expect(Object.keys(subpackagesByDisplayName).sort()).toEqual([
            "BMC Credential",
            "BMC-Reset",
            "Custom Actions",
            "Fleet Operations",
            "Totally Different Label",
            "VPC Peering"
        ]);

        // An SDK group that does not name the tag gets no label from it.
        const authService = ir.services["service_auth"];
        const authSubpackage = ir.subpackages["subpackage_auth"];
        if (authService == null || authSubpackage == null) {
            throw new Error("Expected the auth SDK group to produce a service and subpackage");
        }
        expect(authService.displayName).toBeUndefined();
        expect(authSubpackage.displayName).toBeUndefined();

        // A single-token tag stays unlabeled so that docs still render "Organization Users".
        const organizationUsersService = ir.services["service_organizationUsers"];
        const organizationUsersSubpackage = ir.subpackages["subpackage_organizationUsers"];
        if (organizationUsersService == null || organizationUsersSubpackage == null) {
            throw new Error("Expected the OrganizationUsers tag to produce a service and subpackage");
        }
        expect(organizationUsersService.displayName).toBeUndefined();
        expect(organizationUsersSubpackage.displayName).toBeUndefined();

        // `SSH_Key` also stays unlabeled, because `sshKey` renders as "SSH Key" without help.
        const sshKeyService = ir.services["service_sshKey"];
        const sshKeySubpackage = ir.subpackages["subpackage_sshKey"];
        if (sshKeyService == null || sshKeySubpackage == null) {
            throw new Error("Expected the SSH_Key tag to produce a service and subpackage");
        }
        expect(sshKeyService.displayName).toBeUndefined();
        expect(sshKeySubpackage.displayName).toBeUndefined();

        // Package identity still comes from the tag name, not the display label.
        // Subpackage names may be NameOrString (plain string when no casing overrides).
        const originalName = (name: (typeof ir.subpackages)[string]["name"]) =>
            typeof name === "string" ? name : name.originalName;
        const expectedNamesByDisplayName = {
            "Totally Different Label": "iPxeTemplate",
            "BMC Credential": "bmcCredential",
            "VPC Peering": "vpcPeering",
            "BMC-Reset": "bmcReset",
            // An SDK group renames the package, so the label is the only place the tag survives.
            "Custom Actions": "customactions",
            "Fleet Operations": "fleetoperations"
        };
        for (const [displayName, expectedName] of Object.entries(expectedNamesByDisplayName)) {
            const subpackage = subpackagesByDisplayName[displayName];
            if (subpackage == null) {
                throw new Error(`Expected subpackage with display name ${displayName}`);
            }
            expect(originalName(subpackage.name)).toBe(expectedName);
        }
    }, 90_000);
});
