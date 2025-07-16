import { FernDefinitionFileFormatter } from './FernDefinitionFileFormatter'

export async function formatDefinitionFile({ fileContents }: { fileContents: string }): Promise<string> {
    const formatter = new FernDefinitionFileFormatter({
        fileContents
    })
    return await formatter.format()
}
