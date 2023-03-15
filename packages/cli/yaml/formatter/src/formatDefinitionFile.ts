import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernDefinitionFileFormatter } from "./FernDefinitionFileFormatter";

export function formatDefinitionFile({
    absoluteFilepath,
    fileContents,
}: {
    absoluteFilepath: AbsoluteFilePath;
    fileContents: string;
}): string {
    const formatter = new FernDefinitionFileFormatter({
        fileContents,
        absoluteFilepath,
    });
    return formatter.format();
}
