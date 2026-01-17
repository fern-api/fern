import { FernYml, FernYmlSchema } from "@fern-api/config";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { YamlConfigLoader } from "@fern-api/yaml-loader";
import { FileFinder } from "./FileFinder";

export namespace FernYmlSchemaLoader {
    export interface Options {
        /**
         * The directory to start searching from. Defaults to process.cwd().
         */
        cwd?: string;
    }

    export type Result = YamlConfigLoader.Result<FernYmlSchema>;
}

export class FernYmlSchemaLoader {
    private readonly finder: FileFinder;
    private readonly loader: YamlConfigLoader;

    constructor(options: FernYmlSchemaLoader.Options = {}) {
        const cwd = AbsoluteFilePath.of(options.cwd ?? process.cwd());
        this.finder = new FileFinder({ from: cwd });
        this.loader = new YamlConfigLoader({ cwd });
    }

    /**
     * Finds, loads, and validates a fern.yml configuration file.
     *
     * @returns Result with either the parsed config or validation errors.
     * @throws Error if fern.yml is not found.
     */
    public async load(): Promise<FernYmlSchemaLoader.Result> {
        const absoluteFilePath = await this.finder.findOrThrow(FernYml.FILENAME);
        return await this.loader.load({ absoluteFilePath, schema: FernYmlSchema });
    }
}
