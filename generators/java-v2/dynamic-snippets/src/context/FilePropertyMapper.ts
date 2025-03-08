import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export interface FilePropertyInfo {
    // TODO: Implement me!
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
        return {
            fileFields: [],
            bodyPropertyFields: []
        };
    }
}
