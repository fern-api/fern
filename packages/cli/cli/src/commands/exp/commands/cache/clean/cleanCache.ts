import { rm } from "node:fs/promises";
import { CliContext } from "../../../../../cli-context/CliContext";
import { EXP_GENERATORS_CACHE_DIR } from "../../../config";

export async function cleanCache({ cliContext }: { cliContext: CliContext }) {
    await cliContext.runTask(async (taskContext) => {
        await rm(EXP_GENERATORS_CACHE_DIR, { recursive: true, force: true });
        taskContext.logger.info(`Deleted generator cache at ${EXP_GENERATORS_CACHE_DIR}`);
    });
}
