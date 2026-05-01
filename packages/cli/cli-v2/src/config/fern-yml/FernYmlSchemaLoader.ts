import { FernYmlSchema } from "@fern-api/config";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { ValidationIssue, YamlConfigLoader } from "@fern-api/yaml-loader";
import { SourcedValidationError } from "../../errors/SourcedValidationError.js";
import { FileFinder } from "../FileFinder.js";

const FILENAME = "fern.yml";

export namespace FernYmlSchemaLoader {
    export interface Options {
        /**
         * The directory to start searching from. Defaults to process.cwd().
         */
        cwd?: string;
    }

    export type Result = Result.NotFound | Result.Failure | Result.Success;
    export type Success = Result.Success;

    export namespace Result {
        export interface NotFound {
            type: "notFound";
        }
        export interface Failure {
            type: "failure";
            issues: ValidationIssue[];
        }
        export type Success = { type: "success" } & YamlConfigLoader.Success<FernYmlSchema>;
    }
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
     * This also resolves and validates any `$ref` nodes in the
     * configuration.
     */
    public async loadOrThrow(): Promise<FernYmlSchemaLoader.Success> {
        const loadResult = await this.load();
        if (loadResult.type === "notFound") {
            throw new CliError({
                message: `${FILENAME} file not found in any parent directory; did you forget to run \`fern init\`?`,
                code: CliError.Code.InternalError
            });
        }
        if (loadResult.type === "failure") {
            throw new SourcedValidationError(loadResult.issues);
        }
        return loadResult;
    }

    /**
     * Finds, loads, and validates a fern.yml configuration file.
     * This also resolves and validates any `$ref` nodes in the
     * configuration.
     *
     * @returns `not-found` if no fern.yml exists, `failure` with validation
     *          issues, or `success` with the parsed config.
     */
    public async load(): Promise<FernYmlSchemaLoader.Result> {
        const absoluteFilePath = await this.finder.find({ filename: FILENAME });
        if (absoluteFilePath == null) {
            return { type: "notFound" };
        }
        const result = await this.loader.load({
            absoluteFilePath,
            schema: FernYmlSchema,
            strict: true
        });
        if (!result.success) {
            return { type: "failure", issues: result.issues };
        }
        return { type: "success", ...result };
    }
}
