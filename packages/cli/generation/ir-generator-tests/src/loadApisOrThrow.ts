import { loadApis } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";

export async function loadApisOrThrow(...args: Parameters<typeof loadApis>): ReturnType<typeof loadApis> {
    const result = await loadApis(...args);
    if (result.length === 0) {
        throw new CliError({
            message: "No APIs found. Args: " + JSON.stringify(args, null, 2),
            code: CliError.Code.ConfigError
        });
    }
    return result;
}
