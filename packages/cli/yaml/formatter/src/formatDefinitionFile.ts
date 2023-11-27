import { FernDefinitionFileFormatter } from "./FernDefinitionFileFormatter";

export function formatDefinitionFile({ fileContents }: { fileContents: string }): string {
    const formatter = new FernDefinitionFileFormatter({
        fileContents
    });
    return formatter.format();
}
