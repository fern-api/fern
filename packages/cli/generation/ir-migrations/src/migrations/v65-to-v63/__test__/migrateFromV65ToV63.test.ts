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
        pagination: IrVersions.V65.Pagination | undefined
    ): IrVersions.V65.HttpEndpoint => {
        return {
            pagination
        } as IrVersions.V65.HttpEndpoint;
    };

    const createIRWithEndpoint = (endpoint: IrVersions.V65.HttpEndpoint): IrVersions.V65.IntermediateRepresentation => {
        return {
            services: {
                service_test: {
                    endpoints: [endpoint]
                } as unknown as IrVersions.V65.HttpService
            }
        } as unknown as IrVersions.V65.IntermediateRepresentation;
    };

    const mockResponseProperty: IrVersions.V65.ResponseProperty = {
        property: {} as IrVersions.V65.ObjectProperty,
        propertyPath: []
    };

    it("passes through cursor pagination", () => {
        const cursorPagination = IrVersions.V65.Pagination.cursor({
            page: {
                property: IrVersions.V65.RequestPropertyValue.query({
                    name: { name: { originalName: "cursor" } as IrVersions.V65.Name, wireValue: "cursor" },
                    valueType: IrVersions.V65.TypeReference.primitive({ v1: "STRING", v2: undefined }),
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

        const v65IR = createIRWithEndpoint(createEndpointWithPagination(cursorPagination));
        const migratedIR = V65_TO_V63_MIGRATION.migrateBackwards(v65IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect.assert(migratedEndpoint?.pagination?.type === "cursor");
        expect(migratedEndpoint.pagination.page.property.type).toBe("query");
    });

    it("removes nextUri pagination", () => {
        const nextUriPagination = IrVersions.V65.Pagination.uri({
            nextUri: mockResponseProperty,
            results: mockResponseProperty
        });

        const v65IR = createIRWithEndpoint(createEndpointWithPagination(nextUriPagination));
        const migratedIR = V65_TO_V63_MIGRATION.migrateBackwards(v65IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination).toBeUndefined();
    });

    it("removes nextPath pagination", () => {
        const nextPathPagination = IrVersions.V65.Pagination.path({
            nextPath: mockResponseProperty,
            results: mockResponseProperty
        });

        const v65IR = createIRWithEndpoint(createEndpointWithPagination(nextPathPagination));
        const migratedIR = V65_TO_V63_MIGRATION.migrateBackwards(v65IR, mockContext);
        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination).toBeUndefined();
    });

    it("passes through offset pagination unchanged", () => {
        const offsetPagination = IrVersions.V65.Pagination.offset({
            page: {
                property: IrVersions.V65.RequestPropertyValue.query({
                    name: { name: { originalName: "page" } as IrVersions.V65.Name, wireValue: "page" },
                    valueType: IrVersions.V65.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
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

        const v65IR = createIRWithEndpoint(createEndpointWithPagination(offsetPagination));
        const migratedIR = V65_TO_V63_MIGRATION.migrateBackwards(v65IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination?.type).toBe("offset");
    });

    it("handles endpoint without pagination", () => {
        const v65IR = createIRWithEndpoint(createEndpointWithPagination(undefined));
        const migratedIR = V65_TO_V63_MIGRATION.migrateBackwards(v65IR, mockContext);

        const migratedEndpoint = migratedIR.services["service_test"]?.endpoints[0];
        expect(migratedEndpoint?.pagination).toBeUndefined();
    });
});
