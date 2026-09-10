import { go } from "@fern-api/go-ast";
import { describe, expect, it } from "vitest";

import { getRequestBodyPagePropertySetter, RequestBodyPagePathItem } from "../getRequestBodyPagePropertySetter.js";

const ROOT_IMPORT_PATH = "github.com/acme/acme-go";

function render(node: go.AstNode): string {
    return node.toString({
        packageName: "acme",
        rootImportPath: ROOT_IMPORT_PATH,
        importPath: ROOT_IMPORT_PATH,
        customConfig: {}
    });
}

function reference(name: string): go.Type {
    return go.Type.reference(go.typeReference({ name, importPath: ROOT_IMPORT_PATH }));
}

function object(name: string): Pick<RequestBodyPagePathItem, "pointerValueTypes"> {
    return { pointerValueTypes: [reference(name)] };
}

function value(): Pick<RequestBodyPagePathItem, "pointerValueTypes"> {
    return { pointerValueTypes: [] };
}

function setter(propertyPath: RequestBodyPagePathItem[]): string {
    return render(
        getRequestBodyPagePropertySetter({
            requestReference: "request",
            pagedRequestVariableName: "nextRequest",
            propertyPath,
            fieldName: "Offset",
            value: "pageRequest.Cursor"
        })
    );
}

describe("getRequestBodyPagePropertySetter", () => {
    it("sets a top-level page property directly on the copied request", () => {
        expect(setter([])).toContain(
            ["nextRequest := *request", "nextRequest.Offset = pageRequest.Cursor", ""].join("\n")
        );
    });

    it("allocates a nil pointer intermediate before setting the page property", () => {
        expect(setter([{ fieldName: "Options", ...object("Options") }])).toContain(
            [
                "nextRequest := *request",
                "var nextRequestOptions Options",
                "if nextRequest.Options != nil {",
                "    nextRequestOptions = *nextRequest.Options",
                "}",
                "nextRequest.Options = &nextRequestOptions",
                "nextRequestOptions.Offset = pageRequest.Cursor",
                ""
            ].join("\n")
        );
    });

    it("allocates every pointer intermediate along a multi-level path", () => {
        expect(
            setter([
                { fieldName: "Options", ...object("Options") },
                { fieldName: "Pagination", ...object("Pagination") }
            ])
        ).toContain(
            [
                "nextRequest := *request",
                "var nextRequestOptions Options",
                "if nextRequest.Options != nil {",
                "    nextRequestOptions = *nextRequest.Options",
                "}",
                "nextRequest.Options = &nextRequestOptions",
                "var nextRequestOptionsPagination Pagination",
                "if nextRequestOptions.Pagination != nil {",
                "    nextRequestOptionsPagination = *nextRequestOptions.Pagination",
                "}",
                "nextRequestOptions.Pagination = &nextRequestOptionsPagination",
                "nextRequestOptionsPagination.Offset = pageRequest.Cursor",
                ""
            ].join("\n")
        );
    });

    it("assigns through non-pointer intermediates without allocating", () => {
        expect(
            setter([
                { fieldName: "Options", ...value() },
                { fieldName: "Pagination", ...object("Pagination") }
            ])
        ).toContain(
            [
                "nextRequest := *request",
                "var nextRequestOptionsPagination Pagination",
                "if nextRequest.Options.Pagination != nil {",
                "    nextRequestOptionsPagination = *nextRequest.Options.Pagination",
                "}",
                "nextRequest.Options.Pagination = &nextRequestOptionsPagination",
                "nextRequestOptionsPagination.Offset = pageRequest.Cursor",
                ""
            ].join("\n")
        );
    });

    it("copies every pointer level of a double-pointer intermediate", () => {
        expect(
            setter([{ fieldName: "Options", pointerValueTypes: [reference("OptionsAlias"), reference("Options")] }])
        ).toContain(
            [
                "nextRequest := *request",
                "var nextRequestOptions OptionsAlias",
                "if nextRequest.Options != nil {",
                "    nextRequestOptions = *nextRequest.Options",
                "}",
                "nextRequest.Options = &nextRequestOptions",
                "var nextRequestOptionsValue Options",
                "if nextRequestOptions != nil {",
                "    nextRequestOptionsValue = *nextRequestOptions",
                "}",
                "nextRequestOptions = &nextRequestOptionsValue",
                "nextRequestOptionsValue.Offset = pageRequest.Cursor",
                ""
            ].join("\n")
        );
    });
});
