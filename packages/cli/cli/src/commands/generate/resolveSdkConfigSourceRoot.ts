import path from "node:path";
import { type Spec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";

export interface SdkConfigWorkspaceOwner {
    absoluteFilePath: AbsoluteFilePath;
    workspaceName: string | undefined;
    getAbsoluteFilePaths?: () => AbsoluteFilePath[];
}

/**
 * The directory SDK Config source paths are relative to: the common ancestor of the config's directory, the
 * owning workspace and every file the owner's specs read. `fern sdk migrate` writes paths against the same root.
 */
export function resolveSdkConfigSourceRoot(
    owner: SdkConfigWorkspaceOwner | undefined,
    absolutePathToConfig: string
): string | undefined {
    if (owner == null) {
        return undefined;
    }
    const boundary = commonAncestor(path.dirname(path.resolve(absolutePathToConfig)), owner.absoluteFilePath);
    return [...(owner.getAbsoluteFilePaths?.() ?? []), ...getProtobufPaths(owner)].reduce<string>(
        (current, absoluteFilePath) => commonAncestor(current, absoluteFilePath),
        boundary
    );
}

/**
 * getAbsoluteFilePaths skips from-openapi protobuf specs (they live in `specs`, not `allSpecs`) and reads only
 * a protobuf target, so add every protobuf root and target.
 */
function getProtobufPaths(owner: SdkConfigWorkspaceOwner): AbsoluteFilePath[] {
    if (!(owner instanceof OSSWorkspace)) {
        return [];
    }
    const specs: Spec[] = [...owner.specs, ...owner.allSpecs];
    return specs.flatMap((spec) =>
        spec.type === "protobuf"
            ? [
                  spec.absoluteFilepathToProtobufRoot,
                  ...(spec.absoluteFilepathToProtobufTarget != null ? [spec.absoluteFilepathToProtobufTarget] : [])
              ]
            : []
    );
}

function commonAncestor(candidateRoot: string, candidatePath: string): string {
    const resolvedPath = path.resolve(candidatePath);
    let root = path.resolve(candidateRoot);
    while (!isWithin(root, resolvedPath)) {
        const parent = path.dirname(root);
        if (parent === root) {
            return root;
        }
        root = parent;
    }
    return root;
}

function isWithin(directory: string, candidate: string): boolean {
    const relativePath = path.relative(directory, candidate);
    return relativePath === "" || (!relativePath.startsWith(`..${path.sep}`) && relativePath !== "..");
}
