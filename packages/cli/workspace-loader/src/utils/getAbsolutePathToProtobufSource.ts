import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { ProtobufSource } from "../types/Workspace";
import { FernWorkspace } from "../workspaces/FernWorkspace";

export function getAbsolutePathToProtobufSource(workspace: FernWorkspace): AbsoluteFilePath | undefined {
    const sources = workspace.getSources();

    const protobufSource = sources.find((source) => source.type === "protobuf");
    if (protobufSource != null && (protobufSource as ProtobufSource).root != null) {
        // All roots should be the same, so we prefer the first one (if any).
        return (protobufSource as ProtobufSource).root;
    }

    return undefined;
}
