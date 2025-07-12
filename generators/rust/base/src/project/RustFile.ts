import path from "path";

import { File } from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseRustCustomConfigSchema, rust } from "@fern-api/rust-codegen";

import { FernFilepath } from "@fern-fern/ir-sdk/api";

export type Namespace = string;

export declare namespace RustFile {
    interface Args {
        /* The class to be written to the Rust File */
        clazz: rust.Class | rust.DataClass | rust.Trait | rust.Enum;
        /* Directory of the filepath */
        directory: RelativeFilePath;
        /* The root namespace of the project. Can be pulled directly from context. */
        rootNamespace: string;
        /* Custom generator config */
        customConfig: BaseRustCustomConfigSchema;
    }
}

export class RustFile extends File {
    constructor({ clazz, directory, rootNamespace, customConfig }: RustFile.Args) {
        super(
            `${clazz.name}.php`,
            directory,
            rustFileContent({
                clazz,
                rootNamespace,
                customConfig
            })
        );
    }

    public async tryWrite(directoryPrefix: AbsoluteFilePath): Promise<void> {
        await this.write(directoryPrefix);
    }

    public static getFilePathFromFernFilePath(fernFilePath: FernFilepath): RelativeFilePath {
        return RelativeFilePath.of(path.join(...fernFilePath.allParts.map((part) => part.pascalCase.safeName)));
    }
}

function rustFileContent({
    clazz,
    rootNamespace,
    customConfig
}: {
    clazz: rust.Class | rust.DataClass | rust.Trait | rust.Enum;
    rootNamespace: string;
    customConfig: BaseRustCustomConfigSchema;
}): string {
    return (
        "<?php\n\n" +
        clazz.toString({
            namespace: clazz.namespace,
            rootNamespace,
            customConfig
        })
    );
}
