import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { java } from "@fern-api/java-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
    }
}

export class DynamicTypeMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeMapper.Args): java.Type {
        throw new Error("Not implemented");
    }
}
