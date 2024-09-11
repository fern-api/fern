import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { FernFilepath } from "@fern-fern/ir-sdk/api";
import path from "path";
import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { File } from "@fern-api/generator-commons";

export type Namespace = string;

export declare namespace PhpFile {
    interface Args {
        /* The root namespace of the project. Can be pulled directly from context. */
        namespace: string;
        /* Custom generator config */
        customConfig: BasePhpCustomConfigSchema;
    }
}

export class PhpFile extends File {
    constructor({ namespace, customConfig }: PhpFile.Args) {
        super(
            "Placeholder.php",
            RelativeFilePath.of("Placeholder"),
            `<?php

namespace ${namespace}\\Placeholder;

class Placeholder
{
    public function __construct()
    {
        // TODO: Implement me!
    }
}
`
        );
    }

    public async tryWrite(directoryPrefix: AbsoluteFilePath): Promise<void> {
        await this.write(directoryPrefix);
    }

    public static getFilePathFromFernFilePath(fernFilePath: FernFilepath): RelativeFilePath {
        return RelativeFilePath.of(path.join(...fernFilePath.allParts.map((part) => part.pascalCase.safeName)));
    }
}
