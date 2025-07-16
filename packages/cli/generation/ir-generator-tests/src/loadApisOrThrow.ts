import { loadApis } from "@fern-api/project-loader"

export async function loadApisOrThrow(...args: Parameters<typeof loadApis>): ReturnType<typeof loadApis> {
    const result = await loadApis(...args)
    if (result.length === 0) {
        throw new Error("No APIs found. Args: " + JSON.stringify(args, null, 2))
    }
    return result
}
