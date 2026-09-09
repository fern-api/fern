import { go } from "@fern-api/go-ast";
import { describe, expect, it } from "vitest";

import { getRequestBodyPagePropertySetter } from "../getRequestBodyPagePropertySetter.js";

const ROOT_IMPORT_PATH = "github.com/acme/acme-go";

function render(node: go.AstNode): string {
    return node.toString({
        packageName: "acme",
        rootImportPath: ROOT_IMPORT_PATH,
        importPath: ROOT_IMPORT_PATH,
        customConfig: {}
    });
}

function object(name: string): go.Type {
    return go.Type.pointer(go.Type.reference(go.typeReference({ name, importPath: ROOT_IMPORT_PATH })));
}

function setter(propertyPath: { fieldName: string; type: go.Type }[]): string {
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
        expect(setter([{ fieldName: "Options", type: object("Options") }])).toContain(
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
                { fieldName: "Options", type: object("Options") },
                { fieldName: "Pagination", type: object("Pagination") }
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
                {
                    fieldName: "Options",
                    type: go.Type.reference(go.typeReference({ name: "Options", importPath: ROOT_IMPORT_PATH }))
                },
                { fieldName: "Pagination", type: object("Pagination") }
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
});
