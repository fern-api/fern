import type { Audiences } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { FernIr } from "@fern-api/ir-sdk";
import { getOriginalName, getWireValue } from "@fern-api/ir-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const FIXTURE_NAME = "v3-property-level-audiences";

async function getIRForFixture(audiences: Audiences) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(FIXTURE_NAME), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: FIXTURE_NAME
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenAPI fixture ${FIXTURE_NAME}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${FIXTURE_NAME}`);
    }
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences,
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: true,
        logWarnings: false
    });
}

type IR = Awaited<ReturnType<typeof getIRForFixture>>;

function findEndpointByOperationId(ir: IR, operationId: string): FernIr.HttpEndpoint | undefined {
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            if (getOriginalName(endpoint.name) === operationId) {
                return endpoint;
            }
        }
    }
    return undefined;
}

function getInlineRequestPropertyNames(endpoint: FernIr.HttpEndpoint | undefined): string[] {
    if (endpoint?.requestBody?.type !== "inlinedRequestBody") {
        return [];
    }
    return endpoint.requestBody.properties.map((property) => getWireValue(property.name));
}

function getV2InlineRequestPropertyNames(endpoint: FernIr.HttpEndpoint | undefined): string[] {
    const names: string[] = [];
    for (const body of endpoint?.v2RequestBodies?.requestBodies ?? []) {
        if (body.type !== "inlinedRequestBody") {
            continue;
        }
        for (const property of body.properties) {
            names.push(getWireValue(property.name));
        }
    }
    return names;
}

function getQueryParameterNames(endpoint: FernIr.HttpEndpoint | undefined): string[] {
    return endpoint?.queryParameters.map((qp) => getWireValue(qp.name)) ?? [];
}

function findWebhook(ir: IR, operationId: string): FernIr.Webhook | undefined {
    for (const group of Object.values(ir.webhookGroups)) {
        for (const webhook of group) {
            if (getOriginalName(webhook.name) === operationId) {
                return webhook;
            }
        }
    }
    return undefined;
}

function getWebhookPropertyNames(webhook: FernIr.Webhook | undefined): string[] {
    if (webhook?.payload.type !== "inlinedPayload") {
        return [];
    }
    return webhook.payload.properties.map((property) => getWireValue(property.name));
}

function findTypeProperties(ir: IR, originalTypeName: string): string[] | undefined {
    for (const type of Object.values(ir.types)) {
        if (getOriginalName(type.name.name) !== originalTypeName) {
            continue;
        }
        if (type.shape.type !== "object") {
            return [];
        }
        return type.shape.properties.map((property) => getWireValue(property.name));
    }
    return undefined;
}

// These tests guard the OpenAPI 3.1 → IR audience filter against the regression
// where `x-fern-audiences` on individual inline properties, query parameters,
// and inline webhook payload properties was silently ignored. They also pin
// down behaviour that customers depend on for published SDKs and docs:
//
//   1. With `audiences: { type: "all" }` the IR is left untouched (no scrubbing).
//   2. Untagged properties NEVER get scrubbed when an audience filter is active.
//   3. Properties tagged with audiences that DON'T overlap the filter are
//      scrubbed from both `requestBody.properties` AND `v2RequestBodies`.
//   4. Properties tagged with at least one overlapping audience survive.
//
// `audiences: { type: "all" }` covers the path used by `pnpm fern generate`
// when no `--audience` flag is set; the published SDK path is unaffected by
// this fix and the existing v3-sdks snapshot suite locks that down byte-by-byte.
describe("OpenAPI 3.1 → IR property-level audience filtering (regression coverage)", () => {
    describe("no audience filter (audiences: { type: 'all' })", () => {
        it("keeps every endpoint, type property, and inline request property untouched", async () => {
            const ir = await getIRForFixture({ type: "all" });

            // Endpoints stay intact (universal + tagged + multi-tagged).
            expect(findEndpointByOperationId(ir, "createUser")).toBeDefined();
            expect(findEndpointByOperationId(ir, "listUsers")).toBeDefined();
            expect(findEndpointByOperationId(ir, "listAdmins")).toBeDefined();

            // Every inline property of the createUser request body is present.
            const createUser = findEndpointByOperationId(ir, "createUser");
            expect(getInlineRequestPropertyNames(createUser).sort()).toEqual(
                ["custom_id", "dual_audience_field", "email", "force_verify", "ip_address", "name"].sort()
            );

            // The parallel v2RequestBodies collection mirrors the primary body.
            expect(getV2InlineRequestPropertyNames(createUser).sort()).toEqual(
                ["custom_id", "dual_audience_field", "email", "force_verify", "ip_address", "name"].sort()
            );

            // All query parameters survive (including the internal-only one).
            expect(getQueryParameterNames(createUser).sort()).toEqual(
                ["dual_audience_param", "internal_ref", "page"].sort()
            );

            // Inline webhook payload property survives.
            expect(getWebhookPropertyNames(findWebhook(ir, "userCreated")).sort()).toEqual(
                ["internal_reason", "user_id"].sort()
            );

            // Named-type internal property survives.
            const userProperties = findTypeProperties(ir, "User");
            expect(userProperties?.sort()).toEqual(["id", "password_hash", "username"].sort());
        }, 90_000);
    });

    describe("audiences: { type: 'select', audiences: ['public'] }", () => {
        it("scrubs only inline request properties whose audiences do not overlap [public]", async () => {
            const ir = await getIRForFixture({ type: "select", audiences: ["public"] });

            const createUser = findEndpointByOperationId(ir, "createUser");
            expect(createUser).toBeDefined();

            const requestProperties = getInlineRequestPropertyNames(createUser);
            // Untagged (universal) properties must survive — these are the
            // exact fields that customers ship in their SDKs.
            expect(requestProperties).toContain("name");
            expect(requestProperties).toContain("email");
            expect(requestProperties).toContain("ip_address");
            // Properties whose audiences include "public" must survive.
            expect(requestProperties).toContain("dual_audience_field");
            // Internal-only properties must be scrubbed.
            expect(requestProperties).not.toContain("force_verify");
            expect(requestProperties).not.toContain("custom_id");
        }, 90_000);

        it("also scrubs internal properties from the parallel v2RequestBodies collection", async () => {
            // V3 importers populate `v2RequestBodies` as a sibling of the primary
            // request body. We must scrub both consistently — leaving stale
            // internal fields in v2RequestBodies leaked them to docs.
            const ir = await getIRForFixture({ type: "select", audiences: ["public"] });

            const createUser = findEndpointByOperationId(ir, "createUser");
            const v2Names = getV2InlineRequestPropertyNames(createUser);
            expect(v2Names).toContain("name");
            expect(v2Names).toContain("email");
            expect(v2Names).toContain("dual_audience_field");
            expect(v2Names).not.toContain("force_verify");
            expect(v2Names).not.toContain("custom_id");
        }, 90_000);

        it("scrubs only query parameters whose audiences do not overlap [public]", async () => {
            const ir = await getIRForFixture({ type: "select", audiences: ["public"] });

            const createUser = findEndpointByOperationId(ir, "createUser");
            const queryParams = getQueryParameterNames(createUser);
            expect(queryParams).toContain("page");
            expect(queryParams).toContain("dual_audience_param");
            expect(queryParams).not.toContain("internal_ref");
        }, 90_000);

        it("scrubs only inline webhook payload properties whose audiences do not overlap [public]", async () => {
            const ir = await getIRForFixture({ type: "select", audiences: ["public"] });

            const webhook = findWebhook(ir, "userCreated");
            const properties = getWebhookPropertyNames(webhook);
            expect(properties).toContain("user_id");
            expect(properties).not.toContain("internal_reason");
        }, 90_000);

        it("scrubs only named-type properties whose audiences do not overlap [public]", async () => {
            const ir = await getIRForFixture({ type: "select", audiences: ["public"] });

            const userProperties = findTypeProperties(ir, "User");
            expect(userProperties).toBeDefined();
            expect(userProperties).toContain("id");
            expect(userProperties).toContain("username");
            expect(userProperties).not.toContain("password_hash");
        }, 90_000);

        it("filters out the internal-tagged endpoint while keeping the public one", async () => {
            // Endpoint-level filtering is intentionally exclusive: an endpoint
            // is kept only if at least one of its declared audiences overlaps
            // the active filter. Untagged endpoints are therefore excluded
            // when a filter is active. This pins down the long-standing IR
            // contract that both the Fern and OpenAPI V3 paths already share.
            const ir = await getIRForFixture({ type: "select", audiences: ["public"] });

            expect(findEndpointByOperationId(ir, "createUser")).toBeDefined();
            expect(findEndpointByOperationId(ir, "listUsers")).toBeUndefined();
            expect(findEndpointByOperationId(ir, "listAdmins")).toBeUndefined();
        }, 90_000);

        it("does NOT scrub legitimate untagged inline request properties (SDK regression guard)", async () => {
            // This is the regression the user explicitly called out: never
            // silently filter fields that are not tagged with an audience.
            // Published SDKs ship these fields and must continue to.
            const ir = await getIRForFixture({ type: "select", audiences: ["public"] });

            const createUser = findEndpointByOperationId(ir, "createUser");
            const requestProperties = getInlineRequestPropertyNames(createUser);
            for (const untagged of ["name", "email", "ip_address"]) {
                expect(requestProperties).toContain(untagged);
            }

            const v2Names = getV2InlineRequestPropertyNames(createUser);
            for (const untagged of ["name", "email", "ip_address"]) {
                expect(v2Names).toContain(untagged);
            }

            // Properties whose audiences include the active filter must also survive.
            expect(requestProperties).toContain("dual_audience_field");
            expect(v2Names).toContain("dual_audience_field");
        }, 90_000);

        it("does NOT scrub legitimate untagged query parameters or named-type properties", async () => {
            const ir = await getIRForFixture({ type: "select", audiences: ["public"] });

            const createUser = findEndpointByOperationId(ir, "createUser");
            expect(getQueryParameterNames(createUser)).toContain("page");
            expect(getQueryParameterNames(createUser)).toContain("dual_audience_param");

            const userProperties = findTypeProperties(ir, "User");
            expect(userProperties).toContain("id");
            expect(userProperties).toContain("username");
        }, 90_000);

        it("defense-in-depth: scrubbed identifiers do not appear anywhere in the serialized IR", async () => {
            // Catches accidental leaks of internal-tagged identifiers into
            // serialized v2 example payloads, autogenerated examples, v2
            // request/response bodies, type-level examples, webhook payload
            // examples, or any other shape we might not have explicitly
            // checked. Public-tagged identifiers that survive the filter
            // (e.g. `name`) are intentionally not in this list.
            const ir = await getIRForFixture({ type: "select", audiences: ["public"] });
            const serialized = JSON.stringify(ir);
            for (const scrubbed of ["force_verify", "custom_id", "internal_ref", "internal_reason", "password_hash"]) {
                expect(serialized, `expected scrubbed identifier "${scrubbed}" to be absent from IR`).not.toContain(
                    scrubbed
                );
            }
        }, 90_000);
    });

    describe("audiences: { type: 'select', audiences: ['public', 'internal'] }", () => {
        it("keeps every property when the active filter covers all declared audiences", async () => {
            const ir = await getIRForFixture({ type: "select", audiences: ["public", "internal"] });

            const createUser = findEndpointByOperationId(ir, "createUser");
            expect(getInlineRequestPropertyNames(createUser).sort()).toEqual(
                ["custom_id", "dual_audience_field", "email", "force_verify", "ip_address", "name"].sort()
            );
            expect(getQueryParameterNames(createUser).sort()).toEqual(
                ["dual_audience_param", "internal_ref", "page"].sort()
            );
            expect(getWebhookPropertyNames(findWebhook(ir, "userCreated")).sort()).toEqual(
                ["internal_reason", "user_id"].sort()
            );
            expect(findTypeProperties(ir, "User")?.sort()).toEqual(["id", "password_hash", "username"].sort());
        }, 90_000);
    });

    // The shared filter prunes any IR field whose backing `IrGraph` collection is empty
    // (environments, services, endpoints, types, webhooks, channels, errors). If the V3
    // import path forgets to register a collection, that field silently disappears once
    // an audience filter is active — exactly the regression that stripped every `servers:`
    // URL and caused docs to render `POST /users` instead of `POST https://api.example.com/users`.
    //
    // The tests below pin down the structural contract: anything the V3 path does NOT
    // audience-tag (environments, auth, top-level headers, idempotency headers, base path,
    // path parameters, API name/display name/version, errors referenced by a surviving
    // endpoint) MUST be byte-for-byte identical between the unfiltered IR and any
    // audience-filtered IR.
    describe("structural invariants (regression coverage for untagged top-level fields)", () => {
        // `toEqual` chokes on IR objects that mix plain values with non-plain prototypes
        // (e.g. classes from `@fern-api/ir-sdk` ↔ casing-generator outputs). Comparing the
        // JSON-serialized projection is exactly what the IR ships as on disk and is what
        // the docs/SDK pipeline consumes downstream, so it's the strongest contract we
        // can pin down here.
        function project<T>(value: T): unknown {
            const serialized = JSON.stringify(value);
            return serialized === undefined ? undefined : JSON.parse(serialized);
        }

        it("environments survive intact across every audience filter mode", async () => {
            const [unfiltered, publicOnly, both] = await Promise.all([
                getIRForFixture({ type: "all" }),
                getIRForFixture({ type: "select", audiences: ["public"] }),
                getIRForFixture({ type: "select", audiences: ["public", "internal"] })
            ]);
            const baseline = unfiltered.environments;
            expect(baseline, "fixture must declare at least one server").toBeDefined();
            expect(baseline?.environments.environments.length).toBeGreaterThan(0);
            expect(project(publicOnly.environments)).toEqual(project(baseline));
            expect(project(both.environments)).toEqual(project(baseline));

            // Belt-and-braces: the customer-visible default URL field must round-trip too.
            expect(publicOnly.environments?.defaultEnvironment).toBe(baseline?.defaultEnvironment);
            expect(both.environments?.defaultEnvironment).toBe(baseline?.defaultEnvironment);
        }, 90_000);

        it("untagged top-level fields are structurally identical between unfiltered and filtered IRs", async () => {
            const [unfiltered, filtered] = await Promise.all([
                getIRForFixture({ type: "all" }),
                getIRForFixture({ type: "select", audiences: ["public"] })
            ]);

            // Every field below is either audience-agnostic on the V3 path or
            // intentionally global. If the shared filter ever starts pruning one,
            // this assertion fails before the regression reaches a customer.
            const untouchedKeys = [
                "environments",
                "auth",
                "headers",
                "idempotencyHeaders",
                "apiVersion",
                "apiDisplayName",
                "apiName",
                "apiDocs",
                "basePath",
                "pathParameters",
                "variables",
                "errorDiscriminationStrategy"
            ] as const satisfies readonly (keyof typeof unfiltered)[];

            for (const key of untouchedKeys) {
                expect(project(filtered[key]), `top-level field "${key}" must survive audience filtering`).toEqual(
                    project(unfiltered[key])
                );
            }
        }, 90_000);

        it("endpoints surviving the filter retain their environment-aware url, headers, and path parameters", async () => {
            // Sanity check that endpoint-level structural fields (not just the
            // top-level `environments` map) keep referencing the unfiltered base URL.
            // This is what the docs renderer actually uses to display `POST <base-url>/users`.
            const [unfiltered, filtered] = await Promise.all([
                getIRForFixture({ type: "all" }),
                getIRForFixture({ type: "select", audiences: ["public"] })
            ]);

            const unfilteredEndpoint = findEndpointByOperationId(unfiltered, "createUser");
            const filteredEndpoint = findEndpointByOperationId(filtered, "createUser");
            expect(unfilteredEndpoint).toBeDefined();
            expect(filteredEndpoint).toBeDefined();

            expect(project(filteredEndpoint?.fullPath)).toEqual(project(unfilteredEndpoint?.fullPath));
            expect(project(filteredEndpoint?.path)).toEqual(project(unfilteredEndpoint?.path));
            expect(project(filteredEndpoint?.baseUrl)).toEqual(project(unfilteredEndpoint?.baseUrl));
            expect(project(filteredEndpoint?.headers)).toEqual(project(unfilteredEndpoint?.headers));
            expect(project(filteredEndpoint?.pathParameters)).toEqual(project(unfilteredEndpoint?.pathParameters));
        }, 90_000);
    });
});
