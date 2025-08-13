import { AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import { IntermediateRepresentation, serialization } from "@fern-api/ir-sdk";
import { IntermediateRepresentationChangeDetector } from "@fern-api/ir-utils";
import { FernCliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import semver from "semver";

import { CliContext } from "../../cli-context/CliContext";

export interface Result {
    bump: "major" | "minor" | "patch";
    nextVersion?: string;
    errors: string[];
}

export async function diff({
    context,
    from,
    to,
    fromVersion
}: {
    context: CliContext;
    from: string;
    to: string;
    fromVersion: string | undefined;
}): Promise<Result> {
    const detector = new IntermediateRepresentationChangeDetector();
    const change = await detector.check({
        from: await readIr({ context, filepath: from, flagName: "from" }),
        to: await readIr({ context, filepath: to, flagName: "to" })
    });
    const errors = change.errors.map((error) => error.message);
    if (fromVersion == null) {
        return {
            bump: change.bump,
            errors
        };
    }
    const nextVersion = semver.inc(fromVersion, change.bump);
    if (!nextVersion) {
        context.failWithoutThrowing(`Invalid current version: ${fromVersion}`);
        throw new FernCliError();
    }
    return {
        bump: change.bump,
        nextVersion,
        errors
    };
}

async function readIr({
    context,
    filepath,
    flagName
}: {
    context: CliContext;
    filepath: string;
    flagName: string;
}): Promise<IntermediateRepresentation> {
    const absoluteFilepath = AbsoluteFilePath.of(resolve(cwd(), filepath));
    if (!(await doesPathExist(absoluteFilepath, "file"))) {
        context.failWithoutThrowing(`File not found: ${absoluteFilepath}`);
        throw new FernCliError();
    }
    const ir = await readFile(absoluteFilepath, "utf-8");
    const parsed = serialization.IntermediateRepresentation.parse(JSON.parse(ir));
    if (!parsed.ok) {
        context.failWithoutThrowing(`Invalid --${flagName}; expected a filepath containing a valid IR`);
        throw new FernCliError();
    }
    return parsed.value;
}
