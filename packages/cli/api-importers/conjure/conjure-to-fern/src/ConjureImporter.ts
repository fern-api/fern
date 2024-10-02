import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { APIDefinitionImporter } from "@fern-api/importer-commons";

export declare namespace ConjureImporter {
    interface Args {
        absolutePathToConjureFolder: AbsoluteFilePath;
    }
}

export class ConjureImporter implements APIDefinitionImporter<ConjureImporter.Args> {
    public import(input: ConjureImporter.Args): APIDefinitionImporter.Return {
        throw new Error("Method not implemented.");
    }
}
