import os from "os"
import path from "path"

/**
 * Find the path to a .NET global tool with environment variable support and fallbacks
 * @param {string} toolName - Name of the .NET tool to find
 * @returns {string} - Full path to the tool executable
 */
export function findDotnetToolPath(toolName: string): string {
    // Priority 1: Check if a direct override environment variable exists
    const toolEnvVar = `DOTNET_TOOL_${toolName.toUpperCase()}_PATH`
    if (process.env[toolEnvVar]) {
        return process.env[toolEnvVar]
    }

    // Priority 2: Check custom tools directory from DOTNET_TOOLS_PATH
    if (process.env.DOTNET_TOOLS_PATH) {
        const customPath = path.join(process.env.DOTNET_TOOLS_PATH, toolName)
        return customPath
    }

    // Priority 3: Check DOTNET_CLI_HOME if set
    if (process.env.DOTNET_CLI_HOME) {
        const cliHomePath = path.join(process.env.DOTNET_CLI_HOME, ".dotnet", "tools", toolName)
        return cliHomePath
    }

    // Priority 4: Check standard location based on OS
    const homeDir = os.homedir()
    const standardPath = path.join(homeDir, ".dotnet", "tools", toolName)
    return standardPath
}
