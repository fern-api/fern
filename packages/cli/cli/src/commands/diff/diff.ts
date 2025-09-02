import { diffSemverOrThrow } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import { IntermediateRepresentation, serialization } from "@fern-api/ir-sdk";
import { IntermediateRepresentationChangeDetector } from "@fern-api/ir-utils";
import { FernCliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import semver from "semver";

import { CliContext } from "../../cli-context/CliContext";

export type Bump = "major" | "minor" | "patch";
export interface Result {
    bump: Bump;
    nextVersion?: string;
    errors: string[];
}

export async function diff({
    context,
    from,
    to,
    fromVersion,
    generatorVersions
}: {
    context: CliContext;
    from: string;
    to: string;
    fromVersion: string | undefined;
    generatorVersions: { from: string; to: string } | undefined;
}): Promise<Result> {
    const detector = new IntermediateRepresentationChangeDetector();
    const irChange = resultFromIRChangeResults(
        await detector.check({
            from: await readIr({ context, filepath: from, flagName: "from" }),
            to: await readIr({ context, filepath: to, flagName: "to" })
        })
    );
    const generatorChange = diffGeneratorVersions(generatorVersions);
    const change = mergeDiffResults(irChange, generatorChange);

    if (fromVersion == null) {
        return {
            bump: change.bump,
            errors: change.errors
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
        errors: change.errors
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

function resultFromIRChangeResults(results: IntermediateRepresentationChangeDetector.Result): Result {
    return {
        bump: results.bump,
        errors: results.errors.map((error) => error.message)
    };
}

// export for testing
export function mergeDiffResults(diffA: Result, diffB: Result): Result {
    return {
        bump: maxBump(diffA.bump, diffB.bump),
        errors: [...diffA.errors, ...diffB.errors]
    };
}

function maxBump(bumpA: Result["bump"], bumpB: Result["bump"]): Result["bump"] {
    if (bumpA === "major" || bumpB === "major") {
        return "major";
    }
    if (bumpA === "minor" || bumpB === "minor") {
        return "minor";
    }
    return "patch";
}

// export for testing
export function diffGeneratorVersions(generatorVersions: { from: string; to: string } | undefined): Result {
    if (generatorVersions === undefined) {
        return {
            bump: "patch",
            errors: []
        };
    }
    const { from, to } = generatorVersions;
    const bump = bumpFromDiff(diffSemverOrThrow(from, to)) || "patch";
    let errors: string[] = [];
    if (bump === "major") {
        errors.push("Generator version changed by major version.");
    }

    return {
        bump,
        errors
    };
}

function bumpFromDiff(diff: semver.ReleaseType | null): Result["bump"] | undefined {
    if (diff === null) {
        return undefined;
    }

    switch (diff) {
        case "major":
        case "minor":
        case "patch":
            return diff;
        default:
            return undefined;
    }
}
