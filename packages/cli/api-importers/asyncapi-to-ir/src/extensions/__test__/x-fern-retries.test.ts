import { describe, expect, it, vi } from "vitest";
import { FernRetriesExtension } from "../x-fern-retries";

describe("FernRetriesExtension", () => {
    const mockErrorCollector = {
        collect: vi.fn()
    };

    const mockContext = {
        errorCollector: mockErrorCollector
    } as any;

    const breadcrumbs = ["channels", "myChannel"];

    it("should have the correct key", () => {
        const extension = new FernRetriesExtension({
            breadcrumbs,
            operation: {},
            context: mockContext
        });

        expect(extension.key).toBe("x-fern-retries");
    });

    it("should emit a warning when x-fern-retries is present", () => {
        const operation = {
            "x-fern-retries": {
                disabled: true
            }
        };

        const extension = new FernRetriesExtension({
            breadcrumbs,
            operation,
            context: mockContext
        });

        extension.convert();

        expect(mockErrorCollector.collect).toHaveBeenCalledTimes(1);
        expect(mockErrorCollector.collect).toHaveBeenCalledWith({
            message: expect.stringContaining("x-fern-retries is not supported for AsyncAPI WebSocket channels"),
            path: breadcrumbs
        });
        expect(mockErrorCollector.collect).toHaveBeenCalledWith({
            message: expect.stringContaining("Retry configuration is only supported for OpenAPI HTTP endpoints"),
            path: breadcrumbs
        });
        expect(mockErrorCollector.collect).toHaveBeenCalledWith({
            message: expect.stringContaining("https://docs.buildwithfern.com/api-definition/openapi/extensions/retries"),
            path: breadcrumbs
        });
    });

    it("should not emit a warning when x-fern-retries is absent", () => {
        vi.clearAllMocks();

        const operation = {
            someOtherProperty: "value"
        };

        const extension = new FernRetriesExtension({
            breadcrumbs,
            operation,
            context: mockContext
        });

        const result = extension.convert();

        expect(mockErrorCollector.collect).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it("should not emit a warning when x-fern-retries is null", () => {
        vi.clearAllMocks();

        const operation = {
            "x-fern-retries": null
        };

        const extension = new FernRetriesExtension({
            breadcrumbs,
            operation,
            context: mockContext
        });

        const result = extension.convert();

        expect(mockErrorCollector.collect).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it("should not emit a warning when x-fern-retries is undefined", () => {
        vi.clearAllMocks();

        const operation = {
            "x-fern-retries": undefined
        };

        const extension = new FernRetriesExtension({
            breadcrumbs,
            operation,
            context: mockContext
        });

        const result = extension.convert();

        expect(mockErrorCollector.collect).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it("should emit a warning with correct breadcrumbs path", () => {
        vi.clearAllMocks();

        const customBreadcrumbs = ["channels", "alerts", "operations", "sendAlert"];
        const operation = {
            "x-fern-retries": { disabled: false }
        };

        const extension = new FernRetriesExtension({
            breadcrumbs: customBreadcrumbs,
            operation,
            context: mockContext
        });

        extension.convert();

        expect(mockErrorCollector.collect).toHaveBeenCalledWith({
            message: expect.any(String),
            path: customBreadcrumbs
        });
    });

    it("should emit a warning when x-fern-retries has any truthy value", () => {
        vi.clearAllMocks();

        const operation = {
            "x-fern-retries": "some-string-value"
        };

        const extension = new FernRetriesExtension({
            breadcrumbs,
            operation,
            context: mockContext
        });

        extension.convert();

        expect(mockErrorCollector.collect).toHaveBeenCalledTimes(1);
    });

    it("should emit a warning when x-fern-retries is an empty object", () => {
        vi.clearAllMocks();

        const operation = {
            "x-fern-retries": {}
        };

        const extension = new FernRetriesExtension({
            breadcrumbs,
            operation,
            context: mockContext
        });

        extension.convert();

        expect(mockErrorCollector.collect).toHaveBeenCalledTimes(1);
    });

    it("should return undefined after emitting warning", () => {
        vi.clearAllMocks();

        const operation = {
            "x-fern-retries": { disabled: true }
        };

        const extension = new FernRetriesExtension({
            breadcrumbs,
            operation,
            context: mockContext
        });

        const result = extension.convert();

        expect(result).toBeUndefined();
    });

    it("should handle empty breadcrumbs array", () => {
        vi.clearAllMocks();

        const operation = {
            "x-fern-retries": { disabled: true }
        };

        const extension = new FernRetriesExtension({
            breadcrumbs: [],
            operation,
            context: mockContext
        });

        extension.convert();

        expect(mockErrorCollector.collect).toHaveBeenCalledWith({
            message: expect.any(String),
            path: []
        });
    });
});
