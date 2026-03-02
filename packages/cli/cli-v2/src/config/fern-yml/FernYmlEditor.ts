import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import { type Document, parseDocument } from "yaml";
import { CliError } from "../../errors/CliError.js";
import { FERN_YML_FILENAME, REF_KEY } from "./constants.js";

export namespace FernYmlEditor {
    export interface Config {
        /** Path to the fern.yml file. */
        fernYmlPath: AbsoluteFilePath;
    }
}

/**
 * Stateful editor for mutating fern.yml target configuration.
 */
export class FernYmlEditor {
    private readonly document: Document;
    private readonly filePath: AbsoluteFilePath;
    private readonly targetsPath: string[];

    private constructor({
        document,
        filePath,
        targetsPath
    }: {
        document: Document;
        filePath: AbsoluteFilePath;
        targetsPath: string[];
    }) {
        this.document = document;
        this.filePath = filePath;
        this.targetsPath = targetsPath;
    }

    /**
     * Loads the YAML document that contains the SDK targets.
     *
     * If `sdks` in fern.yml uses a `$ref`, the referenced file is loaded
     * instead. The resolved file path and targets path are determined once
     * at load time.
     */
    public static async load(config: FernYmlEditor.Config): Promise<FernYmlEditor> {
        const content = await readFile(config.fernYmlPath, "utf-8");
        const document = parseDocument(content);
        const doc = document.toJS() as Record<string, unknown>;

        if (doc == null || typeof doc !== "object") {
            throw new CliError({
                message: `Invalid ${FERN_YML_FILENAME}: expected a YAML object; run 'fern init' to initialize a new file.`
            });
        }

        // Check if sdks uses a $ref.
        const sdksValue = doc.sdks;
        if (sdksValue != null && typeof sdksValue === "object" && REF_KEY in sdksValue) {
            const refPath = (sdksValue as Record<string, unknown>)[REF_KEY];
            if (typeof refPath === "string") {
                const resolvedPath = join(dirname(config.fernYmlPath), RelativeFilePath.of(refPath));
                if (!(await doesPathExist(resolvedPath))) {
                    throw new CliError({
                        message: `Referenced file '${refPath}' in ${FERN_YML_FILENAME} does not exist.`
                    });
                }
                const refContent = await readFile(resolvedPath, "utf-8");
                const refDocument = parseDocument(refContent);
                return new FernYmlEditor({
                    document: refDocument,
                    filePath: resolvedPath,
                    targetsPath: ["targets"]
                });
            }
        }

        return new FernYmlEditor({
            document,
            filePath: config.fernYmlPath,
            targetsPath: ["sdks", "targets"]
        });
    }

    /** Sets the version field for an existing target. */
    public setTargetVersion(name: string, version: string): void {
        const existing = this.document.getIn([...this.targetsPath, name]);
        if (existing == null) {
            throw new CliError({
                message: `Target '${name}' not found in SDK configuration.`
            });
        }
        this.document.setIn([...this.targetsPath, name, "version"], version);
    }

    /**
     * Adds a new target entry. Creates intermediate maps (sdks, targets)
     * if they don't exist.
     */
    public addTarget(name: string, value: Record<string, unknown>): void {
        this.ensureMapPath(this.targetsPath);
        this.document.setIn([...this.targetsPath, name], this.document.createNode(value));
    }

    /** Writes the document back to disk, preserving formatting. */
    public async save(): Promise<void> {
        await writeFile(this.filePath, this.document.toString(), "utf-8");
    }

    /**
     * Ensures that the map path exists in the document, creating intermediate
     * maps as needed.
     */
    private ensureMapPath(path: (string | number)[]): void {
        for (let i = 1; i <= path.length; i++) {
            const subPath = path.slice(0, i);
            const existing = this.document.getIn(subPath);
            if (existing == null) {
                this.document.setIn(subPath, this.document.createNode({}));
            }
        }
    }
}
