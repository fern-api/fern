import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { Workspace } from "../types/Workspace";
import { getAllServiceFiles } from "./getAllServiceFiles";

export async function visitAllServiceFiles(
    workspace: Workspace,
    visitor: (filepath: RelativeFilePath, serviceFile: ServiceFileSchema) => void | Promise<void>
): Promise<void> {
    for (const [relativeFilepath, file] of entries(getAllServiceFiles(workspace))) {
        await visitor(relativeFilepath, file.contents);
    }
}
