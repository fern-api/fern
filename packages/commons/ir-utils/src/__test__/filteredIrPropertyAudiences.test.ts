import type { DeclaredTypeName } from "@fern-api/ir-sdk";

import { FilteredIrImpl } from "../filtered-ir/FilteredIr.js";
import { IrGraph } from "../filtered-ir/IrGraph.js";

// Direct (synthetic) FilteredIrImpl for unit-testing the four `hasX` predicates.
function makeFilteredIr({
    excludedProperties = {},
    excludedRequestProperties = {},
    excludedQueryParameters = {},
    excludedWebhookPayloadProperties = {}
}: {
    excludedProperties?: Record<string, Set<string> | undefined>;
    excludedRequestProperties?: Record<string, Set<string> | undefined>;
    excludedQueryParameters?: Record<string, Set<string> | undefined>;
    excludedWebhookPayloadProperties?: Record<string, Set<string> | undefined>;
}): FilteredIrImpl {
    return new FilteredIrImpl({
        types: new Set(),
        environments: new Set(),
        errors: new Set(),
        services: new Set(),
        endpoints: new Set(),
        webhooks: new Set(),
        subpackages: new Set(),
        channels: new Set(),
        excludedProperties,
        excludedRequestProperties,
        excludedQueryParameters,
        excludedWebhookPayloadProperties
    });
}

describe("FilteredIr property-level audience filtering (regression coverage for [CLI] x-fern-audiences)", () => {
    describe("hasProperty (type properties)", () => {
        it("keeps a property when no audience filtering applies to its type", () => {
            const ir = makeFilteredIr({});
            expect(ir.hasProperty("t1", "anything")).toBe(true);
        });

        it("keeps untagged properties when some other property is tagged", () => {
            const ir = makeFilteredIr({ excludedProperties: { t1: new Set(["secret"]) } });
            expect(ir.hasProperty("t1", "id")).toBe(true);
            expect(ir.hasProperty("t1", "name")).toBe(true);
        });

        it("excludes a tagged property whose audiences do not overlap the filter", () => {
            const ir = makeFilteredIr({ excludedProperties: { t1: new Set(["secret"]) } });
            expect(ir.hasProperty("t1", "secret")).toBe(false);
        });

        it("treats different types independently", () => {
            const ir = makeFilteredIr({
                excludedProperties: { t1: new Set(["secret"]), t2: undefined }
            });
            expect(ir.hasProperty("t1", "secret")).toBe(false);
            expect(ir.hasProperty("t2", "secret")).toBe(true);
        });
    });

    describe("hasRequestProperty (inlined request body)", () => {
        it("keeps every property when no filter applies to the endpoint", () => {
            const ir = makeFilteredIr({});
            expect(ir.hasRequestProperty("e1", "anything")).toBe(true);
        });

        it("excludes only excluded request properties", () => {
            const ir = makeFilteredIr({
                excludedRequestProperties: { e1: new Set(["internalDraft"]) }
            });
            expect(ir.hasRequestProperty("e1", "title")).toBe(true);
            expect(ir.hasRequestProperty("e1", "internalDraft")).toBe(false);
        });

        it("does not bleed exclusions across endpoints", () => {
            const ir = makeFilteredIr({
                excludedRequestProperties: { e1: new Set(["internalDraft"]) }
            });
            expect(ir.hasRequestProperty("e2", "internalDraft")).toBe(true);
        });
    });

    describe("hasQueryParameter", () => {
        it("keeps every parameter when no filter applies", () => {
            const ir = makeFilteredIr({});
            expect(ir.hasQueryParameter("e1", "ref")).toBe(true);
        });

        it("excludes only excluded parameters and keeps untagged ones", () => {
            const ir = makeFilteredIr({
                excludedQueryParameters: { e1: new Set(["internalRef"]) }
            });
            expect(ir.hasQueryParameter("e1", "ref")).toBe(true);
            expect(ir.hasQueryParameter("e1", "internalRef")).toBe(false);
        });
    });

    describe("hasWebhookPayloadProperty (inlined webhook payload)", () => {
        it("keeps every property when no filter applies to the webhook", () => {
            const ir = makeFilteredIr({});
            expect(ir.hasWebhookPayloadProperty("w1", "anything")).toBe(true);
        });

        it("excludes only excluded payload properties", () => {
            const ir = makeFilteredIr({
                excludedWebhookPayloadProperties: { w1: new Set(["internalReason"]) }
            });
            expect(ir.hasWebhookPayloadProperty("w1", "userId")).toBe(true);
            expect(ir.hasWebhookPayloadProperty("w1", "internalReason")).toBe(false);
        });
    });
});

// Integration coverage for IrGraph.build() exclusion computation. These guard against
// regressions in the bug scenario described in the original issue: properties whose
// declared audiences do not overlap the active filter must always be excluded.
describe("IrGraph.build() property exclusion (integration)", () => {
    function makeTypeName(originalName: string): DeclaredTypeName {
        return {
            typeId: `type_:${originalName}`,
            name: originalName,
            fernFilepath: { allParts: [], packagePath: [], file: undefined },
            displayName: undefined
        };
    }

    function buildForType({
        activeAudiences,
        propertiesByAudience,
        typeAudiences = ["customer", "admin"]
    }: {
        activeAudiences: string[] | "all";
        propertiesByAudience: Record<string, Set<string>>;
        typeAudiences?: string[];
    }) {
        const graph = new IrGraph(
            activeAudiences === "all" ? { type: "all" } : { type: "select", audiences: activeAudiences }
        );
        const typeName = makeTypeName("User");
        graph.addType({
            declaredTypeName: typeName,
            descendantTypeIds: new Set(),
            descendantTypeIdsByAudience: {},
            propertiesByAudience,
            descendantFilepaths: new Set()
        });
        graph.markTypeForAudiences(typeName, typeAudiences);
        return { filteredIr: graph.build(), typeId: "type_:User" };
    }

    it("regression: keeps untagged properties when no property is tagged with the active audience", () => {
        const { filteredIr, typeId } = buildForType({
            activeAudiences: ["customer"],
            propertiesByAudience: { admin: new Set(["password_hash", "account_balance"]) }
        });
        expect(filteredIr.hasProperty(typeId, "id")).toBe(true);
        expect(filteredIr.hasProperty(typeId, "username")).toBe(true);
        expect(filteredIr.hasProperty(typeId, "password_hash")).toBe(false);
        expect(filteredIr.hasProperty(typeId, "account_balance")).toBe(false);
    });

    it("regression: keeps untagged properties when some property does match the active audience", () => {
        const { filteredIr, typeId } = buildForType({
            activeAudiences: ["customer", "admin"],
            propertiesByAudience: { admin: new Set(["password_hash"]) }
        });
        expect(filteredIr.hasProperty(typeId, "id")).toBe(true);
        expect(filteredIr.hasProperty(typeId, "password_hash")).toBe(true);
    });

    it("excludes only properties whose audiences do not overlap the active filter", () => {
        const { filteredIr, typeId } = buildForType({
            activeAudiences: ["customer"],
            propertiesByAudience: {
                customer: new Set(["public_field"]),
                admin: new Set(["admin_field"]),
                multi_audience: new Set(["multi_field"])
            }
        });
        expect(filteredIr.hasProperty(typeId, "untagged_field")).toBe(true);
        expect(filteredIr.hasProperty(typeId, "public_field")).toBe(true);
        expect(filteredIr.hasProperty(typeId, "admin_field")).toBe(false);
        expect(filteredIr.hasProperty(typeId, "multi_field")).toBe(false);
    });

    it("keeps a property if any of its declared audiences overlaps the active filter", () => {
        const { filteredIr, typeId } = buildForType({
            activeAudiences: ["customer"],
            propertiesByAudience: {
                customer: new Set(["shared_field"]),
                admin: new Set(["shared_field", "admin_only_field"])
            }
        });
        expect(filteredIr.hasProperty(typeId, "shared_field")).toBe(true);
        expect(filteredIr.hasProperty(typeId, "admin_only_field")).toBe(false);
    });

    it("keeps every property when no audience filtering is configured", () => {
        const { filteredIr, typeId } = buildForType({
            activeAudiences: "all",
            propertiesByAudience: { admin: new Set(["password_hash"]) }
        });
        expect(filteredIr.hasProperty(typeId, "id")).toBe(true);
        expect(filteredIr.hasProperty(typeId, "password_hash")).toBe(true);
    });
});
