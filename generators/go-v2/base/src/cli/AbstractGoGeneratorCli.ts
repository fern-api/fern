import { AbstractGeneratorCli, File, parseIR } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

import { serialization as IrSerialization } from "@fern-fern/ir-sdk";
import { AbstractGoGeneratorContext } from "../context/AbstractGoGeneratorContext.js";

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
        return await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        });
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
