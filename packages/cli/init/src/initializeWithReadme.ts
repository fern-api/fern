import { AbsoluteFilePath, cwd, isURL } from "@fern-api/fs-utils"
import { runReadmeMigration } from "@fern-api/readme-importer"
import { TaskContext } from "@fern-api/task-context"

export const initializeWithReadme = async ({
    readmeUrl,
    organization,
    taskContext,
    versionOfCli
}: {
    readmeUrl?: string
    organization: string
    taskContext: TaskContext
    versionOfCli: string
}): Promise<void> => {
    if (!readmeUrl || !isURL(readmeUrl)) {
        taskContext.failAndThrow("Provide a URL to a readme-generated site")
        return
    }

    const outputPath = AbsoluteFilePath.of(cwd())

    await runReadmeMigration({
        readmeUrl,
        outputPath,
        taskContext,
        versionOfCli,
        organization
    })
}
