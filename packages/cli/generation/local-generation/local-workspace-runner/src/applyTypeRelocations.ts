import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation, serialization as IrSerialization } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { readFile, rm } from "fs/promises";
import { TYPE_RELOCATIONS_FILENAME } from "./constants.js";

/**
 * Some generators (e.g. Go) break import cycles by relocating "leaf" types into
 * a shared package. They do this in their own in-memory copy of the IR, so the
 * relocations are invisible to the host-side dynamic snippet test generator,
 * which would otherwise emit snippets referencing the types from their
 * pre-relocation packages and fail to compile.
 *
 * When relocations occur, the generator writes them to a file in its output
 * directory (see `TYPE_RELOCATIONS_OUTPUT_FILEPATH_ENV_VAR`). This applies those
 * relocations to the host's IR (mirroring what the generator did internally) and
 * then deletes the file so it never ships in the generated SDK.
 *
 * No-op when the file is absent (i.e. no cycle-breaking happened, or the
 * generator does not emit relocations).
 */
export async function applyTypeRelocations({
    ir,
    tmpOutputDirectory,
    context
}: {
    ir: IntermediateRepresentation;
    tmpOutputDirectory: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    const relocationsFilepath = join(tmpOutputDirectory, RelativeFilePath.of(TYPE_RELOCATIONS_FILENAME));

    let contents: string;
    try {
        contents = await readFile(relocationsFilepath, "utf-8");
    } catch {
        // No file means the generator did not relocate any types.
        return;
    }

    try {
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
    } catch (error) {
        context.logger.warn(
            `Failed to apply type relocations from ${relocationsFilepath}: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    } finally {
        // Never let the relocations file leak into the generated SDK output.
        await rm(relocationsFilepath, { force: true });
    }
}
