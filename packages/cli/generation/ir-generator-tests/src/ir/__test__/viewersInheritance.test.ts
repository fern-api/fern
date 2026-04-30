import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { getOriginalName } from "@fern-api/ir-utils";
import path from "path";

import { generateIRFromPath } from "./generateAndSnapshotIR.js";

const FIXTURE_DIR = AbsoluteFilePath.of(
    path.join(__dirname, "../../../../../../../test-definitions/fern/apis/viewers-rbac-fern-def")
);

describe("viewers (RBAC) inheritance", () => {
    it("propagates service-level viewers to endpoints when not overridden, respects endpoint overrides, and preserves webhook viewers", async () => {
        const ir = await generateIRFromPath({
            absolutePathToWorkspace: FIXTURE_DIR,
            workspaceName: "viewers-rbac-fern-def",
            audiences: { type: "all" }
        });

        const service = ir.services["service_plants"];
        if (service == null) {
            throw new Error("expected service_plants in IR");
        }
        expect(service.viewers).toEqual(["admin", "gardener"]);

        const endpointsByName = new Map(service.endpoints.map((e) => [getOriginalName(e.name), e]));

        // Endpoint without explicit viewers inherits from the service.
        expect(endpointsByName.get("list")?.viewers).toEqual(["admin", "gardener"]);

        // Endpoint with its own viewers wins over service-level default.
        expect(endpointsByName.get("create")?.viewers).toEqual(["admin"]);

        // Another endpoint with no override inherits the service-level default.
        expect(endpointsByName.get("delete")?.viewers).toEqual(["admin", "gardener"]);

        const webhookGroup = ir.webhookGroups["webhooks_webhooks"];
        if (webhookGroup == null) {
            throw new Error("expected webhooks_webhooks group in IR");
        }
        const webhook = webhookGroup.find((w) => getOriginalName(w.name) === "plantPlanted");
        expect(webhook?.viewers).toEqual(["gardener"]);
    }, 60_000);
});
