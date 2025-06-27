import { FileDescriptorProto } from "@bufbuild/protobuf/dist/cjs/wkt/gen/google/protobuf/descriptor_pb";

import { SOURCE_CODE_INFO_PATH_STARTERS } from "./PathFieldNumbers";

export type PathStarterValues = (typeof SOURCE_CODE_INFO_PATH_STARTERS)[keyof typeof SOURCE_CODE_INFO_PATH_STARTERS];

// Updated type to allow comment at each level
export type CommentNode = {
    _comment?: string; // The comment for this node itself
    [key: number]: CommentNode; // Child nodes
};

export function createGlobalCommentsStore(spec: FileDescriptorProto): Record<PathStarterValues, CommentNode> {
    const commentsByStartingNodeType: Record<PathStarterValues, CommentNode> = {
        4: {},
        5: {},
        6: {}
    };

    spec.sourceCodeInfo?.location.forEach((sourceCodeInfoLocation) => {
        const path = sourceCodeInfoLocation.path;

        if (!path || path.length === 0) {
            return;
        }

        const startValue = path[0] as PathStarterValues;
        if (!(startValue in commentsByStartingNodeType)) {
            return;
        }

        const comment = sourceCodeInfoLocation.leadingComments || sourceCodeInfoLocation.trailingComments || "";

        if (!comment) {
            return;
        }

        let current: CommentNode = commentsByStartingNodeType[startValue];

        // Navigate to the correct node, creating nodes as needed
        for (let i = 1; i < path.length; i++) {
            const key = path[i];

            if (key === undefined) {
                continue;
            }

            if (!(key in current)) {
                current[key] = {};
            }

            current = current[key]!; // Add non-null assertion since we just created it
        }

        // Set the comment on the node we reached
        current._comment = comment.trim();
    });

    return commentsByStartingNodeType;
}
