import { readFile } from "fs/promises";
import semver from "semver";

import { AbsoluteFilePath, cwd, doesPathExist } from "@fern-api/fs-utils";
import { resolve } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk/src/sdk/api";
import { IntermediateRepresentation as Serialize } from "@fern-api/ir-sdk/src/sdk/serialization";
import { IntermediateRepresentationChangeDetector } from "@fern-api/ir-utils";
import { FernCliError } from "@fern-api/task-context";

import { CliContext } from "../../../cli-context/CliContext";

export interface Result {
    bump: "major" | "minor" | "patch";
    nextVersion: string;
}

export async function getSdkVersion({
    context,
    from,
    to,
    fromVersion
}: {
    context: CliContext;
    from: string;
    to: string;
    fromVersion: string;
}): Promise<Result> {
    const detector = new IntermediateRepresentationChangeDetector();
    const change = await detector.detectChanges({
        from: await readIr({ context, filepath: from, flagName: "from" }),
        to: await readIr({ context, filepath: to, flagName: "to" })
    });
    const nextVersion = semver.inc(fromVersion, change.bump);
    if (!nextVersion) {
        context.failWithoutThrowing(`Invalid current version: ${fromVersion}`);
        throw new FernCliError();
    }
    return {
        bump: change.bump,
        nextVersion
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
    const parsed = Serialize.parse(ir);
    if (!parsed.ok) {
        context.failWithoutThrowing(
            `Invalid --${flagName}; expected a filepath containing a valid IR: ${JSON.stringify(parsed.errors)}`
        );
        throw new FernCliError();
    }
    return parsed.value;
}
