import { RelativeFilePath } from "@fern-api/fs-utils";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { Workspace } from "../types/Workspace";
import { getAllServiceFiles } from "./getAllServiceFiles";

export function getServiceFile(
    workspace: Workspace,
    relativeFilepath: RelativeFilePath
): ServiceFileSchema | undefined {
    return getAllServiceFiles(workspace.definition)[relativeFilepath]?.contents;
}
