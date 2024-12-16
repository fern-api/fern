import { ts } from "@fern-api/typescript-ast";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { Severity } from "@fern-api/browser-compatible-base-generator";

export interface FilePropertyInfo {
    fileFields: ts.Type[];
    bodyPropertyFields: ts.Type[];
}

export class FilePropertyMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public getFilePropertyInfo({
        body,
        value
    }: {
        body: FernIr.dynamic.FileUploadRequestBody;
        value: unknown;
    }): FilePropertyInfo {
        return { fileFields: [], bodyPropertyFields: [] };
    }

    private getSingleFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty;
        record: Record<string, unknown>;
    }): ts.Type {
        // TODO: Implement
        return ts.Type.nop();
        // const fileValue = record[property.wireValue];
        // if (fileValue == null) {
        //     return typescript.Type.undefined();
        // }
        // if (typeof fileValue !== "string") {
        //     this.context.errors.add({ severity: Severity.Critical, message: `Expected file value to be a string, got ${typeof fileValue}` });
        //     return typescript.Type.undefined();
        // }
        // return typescript.Type.string(fileValue as string);
    }
}
