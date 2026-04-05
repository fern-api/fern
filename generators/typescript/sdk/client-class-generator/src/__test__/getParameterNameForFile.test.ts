import { FernIr } from "@fern-fern/ir-sdk";
import { caseConverter, createNameAndWireValue } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";
import { getParameterNameForFile } from "../endpoints/utils/getParameterNameForFile.js";

function createFileProperty(name: string): FernIr.FileProperty {
    return FernIr.FileProperty.file({
        key: createNameAndWireValue(name),
        isOptional: false,
        contentType: undefined,
        docs: undefined
    });
}

describe("getParameterNameForFile", () => {
    it("returns camelCase name when includeSerdeLayer=true and retainOriginalCasing=false", () => {
        const property = createFileProperty("myFile");
        const result = getParameterNameForFile({
            property,
            caseConverter,
            wrapperName: "request",
            includeSerdeLayer: true,
            retainOriginalCasing: false,
            inlineFileProperties: false
        });
        expect(result).toBe("myFile");
    });

    it("returns original name when includeSerdeLayer=false", () => {
        const property = createFileProperty("myFile");
        const result = getParameterNameForFile({
            property,
            caseConverter,
            wrapperName: "request",
            includeSerdeLayer: false,
            retainOriginalCasing: false,
            inlineFileProperties: false
        });
        expect(result).toBe("myFile");
    });

    it("returns original name when retainOriginalCasing=true", () => {
        const property = createFileProperty("myFile");
        const result = getParameterNameForFile({
            property,
            caseConverter,
            wrapperName: "request",
            includeSerdeLayer: true,
            retainOriginalCasing: true,
            inlineFileProperties: false
        });
        expect(result).toBe("myFile");
    });

    it("prefixes with wrapper name when inlineFileProperties=true", () => {
        const property = createFileProperty("myFile");
        const result = getParameterNameForFile({
            property,
            caseConverter,
            wrapperName: "request",
            includeSerdeLayer: true,
            retainOriginalCasing: false,
            inlineFileProperties: true
        });
        expect(result).toBe("request.myFile");
    });

    it("prefixes with wrapper name and uses originalName when retainOriginalCasing=true and inline=true", () => {
        const property = createFileProperty("myFile");
        const result = getParameterNameForFile({
            property,
            caseConverter,
            wrapperName: "req",
            includeSerdeLayer: true,
            retainOriginalCasing: true,
            inlineFileProperties: true
        });
        expect(result).toBe("req.myFile");
    });
});
