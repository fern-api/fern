import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernServiceFileFormatter } from "./FernServiceFileFormatter";

export function formatServiceFile({
    absoluteFilepath,
    fileContents,
}: {
    absoluteFilepath: AbsoluteFilePath;
    fileContents: string;
    context: TaskContext;
}): string {
    const formatter = new FernServiceFileFormatter({
        fileContents,
        absoluteFilepath,
    });
    return formatter.format();
}
