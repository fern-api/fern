import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernServiceFileFormatter } from "./FernServiceFileFormatter";

export function formatServiceFile({
    absoluteFilepath,
    fileContents,
}: {
    absoluteFilepath: AbsoluteFilePath;
    fileContents: string;
}): string {
    const formatter = new FernServiceFileFormatter({
        fileContents,
        absoluteFilepath,
    });
    return formatter.format();
}
