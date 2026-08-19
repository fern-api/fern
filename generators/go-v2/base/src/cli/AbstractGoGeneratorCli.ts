import { AbstractGeneratorCli, File, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { readFile } from "fs/promises";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

import { serialization as IrSerialization } from "@fern-fern/ir-sdk";
import { AbstractGoGeneratorContext } from "../context/AbstractGoGeneratorContext.js";

/**
 * Suffix appended to the IR filepath to locate the sidecar file the native
 * (v1) Go generator writes with the type locations it relocated while breaking
 * import cycles. Must match `typeRelocationsFileSuffix` in
 * `generators/go/internal/generator/generator.go`.
 */
const TYPE_RELOCATIONS_FILE_SUFFIX = ".relocations.json";

export abstract class AbstractGoGeneratorCli<
    CustomConfig extends BaseGoCustomConfigSchema,
    GoGeneratorContext extends AbstractGoGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, GoGeneratorContext> {
    /**
     * Parses the IR for the PHP generators
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        const ir = await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
        await this.applyTypeRelocations(ir, irFilepath);
        return ir;
    }

    /**
     * The native (v1) Go generator breaks import cycles by relocating "leaf"
     * types into a shared `common` package, but it does this in its own
     * in-memory copy of the IR. Because this generator runs as a separate
     * subprocess against the original IR file, it would otherwise reference
     * those types from their pre-relocation packages and emit undefined
     * symbols. v1 records the relocations in a sidecar file next to the IR;
     * here we apply them so both generators agree on where each type lives.
     */
    private async applyTypeRelocations(ir: IntermediateRepresentation, irFilepath: string): Promise<void> {
        let contents: string;
        try {
            contents = await readFile(irFilepath + TYPE_RELOCATIONS_FILE_SUFFIX, "utf-8");
        } catch {
            // No sidecar file means no cycle-breaking relocations were applied.
            return;
        }
        const relocations: unknown = JSON.parse(contents);
        if (typeof relocations !== "object" || relocations == null) {
            return;
        }
        const parseOptions = {
            unrecognizedObjectKeys: "passthrough",
            allowUnrecognizedEnumValues: true,
            allowUnrecognizedUnionMembers: true,
            skipValidation: true
        } as const;
        for (const [typeId, rawFernFilepath] of Object.entries(relocations)) {
            const typeDeclaration = ir.types[typeId];
            if (typeDeclaration != null) {
                typeDeclaration.name = {
                    ...typeDeclaration.name,
                    fernFilepath: await IrSerialization.FernFilepath.parseOrThrow(rawFernFilepath, parseOptions)
                };
            }
            // The dynamic IR powers snippet generation and carries its own copy
            // of each type's location, so it must be relocated in lockstep.
            const dynamicType = ir.dynamic?.types[typeId];
            if (dynamicType != null) {
                dynamicType.declaration = {
                    ...dynamicType.declaration,
                    fernFilepath: await IrSerialization.dynamic.FernFilepath.parseOrThrow(rawFernFilepath, parseOptions)
                };
            }
        }
    }

    protected async generateMetadata(context: GoGeneratorContext): Promise<void> {
        // For local-file-system output, the generator config carries no version
        // in its output mode. Fall back to the Go publish target on the IR, which
        // the CLI populates when the user explicitly passes `--version`.
        let sdkVersion = context.version ?? this.readVersionFromPublishConfig(context.ir.publishConfig);
        // Go convention requires version strings to have a "v" prefix
        if (sdkVersion != null && sdkVersion !== "" && !sdkVersion.startsWith("v")) {
            sdkVersion = "v" + sdkVersion;
        }
        const metadata = {
            ...context.ir.generationMetadata,
            sdkVersion
        };
        const content = JSON.stringify(metadata, null, 2);
        if (context.project != null && File != null) {
            context.project.addRawFiles(
                new File(this.GENERATION_METADATA_FILENAME, this.GENERATION_METADATA_FILEPATH, content)
            );
        }
    }

    private readVersionFromPublishConfig(publishConfig: FernIr.PublishingConfig | undefined): string | undefined {
        if (publishConfig?.type !== "filesystem") {
            return undefined;
        }
        // The `go` publish target is a newer IR addition than the `@fern-fern/ir-sdk`
        // version this generator is pinned against, so we read it via a narrow
        // structural type rather than depending on the union literal.
        const publishTarget = publishConfig.publishTarget as { type?: string; version?: string } | undefined;
        if (publishTarget?.type !== "go") {
            return undefined;
        }
        return publishTarget.version;
    }
}
