import { NodePath } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";

import { DocsConfigFileAstVisitor } from "./DocsConfigFileAstVisitor";

export async function visitFilepath({
    absoluteFilepathToConfiguration,
    rawUnresolvedFilepath,
    visitor,
    nodePath,
    willBeUploaded = true
}: {
    absoluteFilepathToConfiguration: AbsoluteFilePath;
    rawUnresolvedFilepath: string;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
    willBeUploaded?: boolean;
}): Promise<void> {
    const absoluteFilepath = resolve(dirname(absoluteFilepathToConfiguration), rawUnresolvedFilepath);
    await visitor.filepath?.(
        {
            absoluteFilepath,
            value: rawUnresolvedFilepath,
            willBeUploaded
        },
        nodePath
    );
}
