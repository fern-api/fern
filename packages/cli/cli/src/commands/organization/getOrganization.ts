import { writeFile } from "fs/promises";

import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";

export async function getOrganziation({
    project,
    outputLocation,
    context
}: {
    project: Project;
    outputLocation: string | undefined;
    context: CliContext;
}): Promise<void> {
    const org = project.config.organization;
    if (outputLocation == null) {
        process.stdout.write(org);
        return;
    }

    try {
        await writeFile(outputLocation, org);
    } catch (error) {
        context.failAndThrow(`Could not write file to the specified location: ${outputLocation}`, error);
    }
}
