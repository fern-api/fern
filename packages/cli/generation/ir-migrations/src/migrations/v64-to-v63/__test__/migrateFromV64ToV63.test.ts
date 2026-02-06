import { createMockTaskContext } from "@fern-api/task-context";

import { IrVersions } from "../../../ir-versions";
import { V64_TO_V63_MIGRATION } from "../migrateFromV64ToV63";

describe("migrateFromV64ToV63", () => {
    const mockContext = {
        taskContext: createMockTaskContext(),
        targetGenerator: {
            name: "test-generator",
            version: "0.0.0"
        }
    };

    const createEndpointWithPagination = (
        pagination: IrVersions.V64.Pagination | undefined
    ): IrVersions.V64.HttpEndpoint => {
        return {
            pagination
        } as IrVersions.V64.HttpEndpoint;
    };

    const createIRWithEndpoint = (endpoint: IrVersions.V64.HttpEndpoint): IrVersions.V64.IntermediateRepresentation => {
        return {
            services: {
                service_test: {
                    endpoints: [endpoint]
                } as unknown as IrVersions.V64.HttpService
            }
        } as unknown as IrVersions.V64.IntermediateRepresentation;
    };

    const mockResponseProperty: IrVersions.V64.ResponseProperty = {
        property: {} as IrVersions.V64.ObjectProperty,
        propertyPath: []
    };

    it("passes through cursor pagination", () => {
        const cursorPagination = IrVersions.V64.Pagination.cursor({
            page: {
                property: IrVersions.V64.RequestPropertyValue.query({
                    name: { name: { originalName: "cursor" } as IrVersions.V64.Name, wireValue: "cursor" },
                    valueType: IrVersions.V64.TypeReference.primitive({ v1: "STRING", v2: undefined }),
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

        const v64IR = createIRWithEndpoint(createEndpointWithPagination(cursorPagination));
        const migratedIR = V64_TO_V63_MIGRATION.migrateBackwards(v64IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination?.type).toBe("cursor");
        if (migratedEndpoint?.pagination?.type === "cursor") {
            expect(migratedEndpoint.pagination.page.property.type).toBe("query");
        }
    });

    it("throws error for nextUri pagination", () => {
        const nextUriPagination = IrVersions.V64.Pagination.uri({
            nextUri: mockResponseProperty,
            results: mockResponseProperty
        });

        const v64IR = createIRWithEndpoint(createEndpointWithPagination(nextUriPagination));

        expect(() => {
            V64_TO_V63_MIGRATION.migrateBackwards(v64IR, mockContext);
        }).toThrow("CursorPagination with 'uri' locator cannot be migrated to IR v63");
    });

    it("throws error for nextPath pagination", () => {
        const nextPathPagination = IrVersions.V64.Pagination.path({
            nextPath: mockResponseProperty,
            results: mockResponseProperty
        });

        const v64IR = createIRWithEndpoint(createEndpointWithPagination(nextPathPagination));

        expect(() => {
            V64_TO_V63_MIGRATION.migrateBackwards(v64IR, mockContext);
        }).toThrow("CursorPagination with 'path' locator cannot be migrated to IR v63");
    });

    it("passes through offset pagination unchanged", () => {
        const offsetPagination = IrVersions.V64.Pagination.offset({
            page: {
                property: IrVersions.V64.RequestPropertyValue.query({
                    name: { name: { originalName: "page" } as IrVersions.V64.Name, wireValue: "page" },
                    valueType: IrVersions.V64.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
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

        const v64IR = createIRWithEndpoint(createEndpointWithPagination(offsetPagination));
        const migratedIR = V64_TO_V63_MIGRATION.migrateBackwards(v64IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination?.type).toBe("offset");
    });

    it("handles endpoint without pagination", () => {
        const v64IR = createIRWithEndpoint(createEndpointWithPagination(undefined));
        const migratedIR = V64_TO_V63_MIGRATION.migrateBackwards(v64IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination).toBeUndefined();
    });
});
