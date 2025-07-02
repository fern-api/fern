import { FileDescriptorProto } from "@bufbuild/protobuf/dist/cjs/wkt/gen/google/protobuf/descriptor_pb";

import { SOURCE_CODE_INFO_PATH_STARTERS } from "./PathFieldNumbers";

export type PathStarterValues = (typeof SOURCE_CODE_INFO_PATH_STARTERS)[keyof typeof SOURCE_CODE_INFO_PATH_STARTERS];

export type CommentNode = {
    _comment?: string;
    [key: number]: CommentNode;
};

export function createGlobalCommentsStore(spec: FileDescriptorProto): Record<PathStarterValues, CommentNode> {
    const commentsByStartingNodeType: Record<PathStarterValues, CommentNode> = {
        4: {},
        5: {},
        6: {}
    };

    if (spec.package?.startsWith("google.protobuf")) {
        return commentsByStartingNodeType;
    }

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

        for (let i = 1; i < path.length; i++) {
            const key = path[i];

            if (key == null) {
                continue;
            }

            if (!(key in current)) {
                current[key] = {};
            }

            current = current[key] as CommentNode;
        }

        current._comment = comment.trim();
    });

    return commentsByStartingNodeType;
}
