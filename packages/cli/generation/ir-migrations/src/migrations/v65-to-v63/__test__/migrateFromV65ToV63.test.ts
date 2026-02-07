import { createMockTaskContext } from "@fern-api/task-context";

import { IrVersions } from "../../../ir-versions";
import { V65_TO_V63_MIGRATION } from "../migrateFromV65ToV63";

describe("migrateFromV65ToV63", () => {
    const mockContext = {
        taskContext: createMockTaskContext(),
        targetGenerator: {
            name: "test-generator",
            version: "0.0.0"
        }
    };

    const createEndpointWithPagination = (
        pagination: IrVersions.V63.Pagination | undefined
    ): IrVersions.V63.HttpEndpoint => {
        return {
            pagination
        } as IrVersions.V63.HttpEndpoint;
    };

    const createIRWithEndpoint = (endpoint: IrVersions.V63.HttpEndpoint): IrVersions.V63.IntermediateRepresentation => {
        return {
            services: {
                service_test: {
                    endpoints: [endpoint]
                } as unknown as IrVersions.V63.HttpService
            }
        } as unknown as IrVersions.V63.IntermediateRepresentation;
    };

    const mockResponseProperty: IrVersions.V63.ResponseProperty = {
        property: {} as IrVersions.V63.ObjectProperty,
        propertyPath: []
    };

    it("passes through cursor pagination", () => {
        const cursorPagination = IrVersions.V63.Pagination.cursor({
            page: {
                property: IrVersions.V63.RequestPropertyValue.query({
                    name: { name: { originalName: "cursor" } as IrVersions.V63.Name, wireValue: "cursor" },
                    valueType: IrVersions.V63.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    allowMultiple: false,
                    v2Examples: undefined,
                    explode: undefined,
                    availability: undefined,
                    docs: undefined
                }),
                propertyPath: []
            },
            next: mockResponseProperty,
            results: mockResponseProperty
        });

        const v63IR = createIRWithEndpoint(createEndpointWithPagination(cursorPagination));
        const migratedIR = V65_TO_V63_MIGRATION.migrateBackwards(v63IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination?.type).toBe("cursor");
        if (migratedEndpoint?.pagination?.type === "cursor") {
            expect(migratedEndpoint.pagination.page.property.type).toBe("query");
        }
    });

    it("throws error for nextUri pagination", () => {
        const nextUriPagination = IrVersions.V63.Pagination.uri({
            nextUri: mockResponseProperty,
            results: mockResponseProperty
        });

        const v63IR = createIRWithEndpoint(createEndpointWithPagination(nextUriPagination));

        expect(() => {
            V65_TO_V63_MIGRATION.migrateBackwards(v63IR, mockContext);
        }).toThrow("CursorPagination with 'uri' locator cannot be migrated to IR v63");
    });

    it("throws error for nextPath pagination", () => {
        const nextPathPagination = IrVersions.V63.Pagination.path({
            nextPath: mockResponseProperty,
            results: mockResponseProperty
        });

        const v63IR = createIRWithEndpoint(createEndpointWithPagination(nextPathPagination));

        expect(() => {
            V65_TO_V63_MIGRATION.migrateBackwards(v63IR, mockContext);
        }).toThrow("CursorPagination with 'path' locator cannot be migrated to IR v63");
    });

    it("passes through offset pagination unchanged", () => {
        const offsetPagination = IrVersions.V63.Pagination.offset({
            page: {
                property: IrVersions.V63.RequestPropertyValue.query({
                    name: { name: { originalName: "page" } as IrVersions.V63.Name, wireValue: "page" },
                    valueType: IrVersions.V63.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                    allowMultiple: false,
                    v2Examples: undefined,
                    explode: undefined,
                    availability: undefined,
                    docs: undefined
                }),
                propertyPath: []
            },
            results: mockResponseProperty,
            step: undefined,
            hasNextPage: undefined
        });

        const v63IR = createIRWithEndpoint(createEndpointWithPagination(offsetPagination));
        const migratedIR = V65_TO_V63_MIGRATION.migrateBackwards(v63IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination?.type).toBe("offset");
    });

    it("handles endpoint without pagination", () => {
        const v63IR = createIRWithEndpoint(createEndpointWithPagination(undefined));
        const migratedIR = V65_TO_V63_MIGRATION.migrateBackwards(v63IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination).toBeUndefined();
    });
});
