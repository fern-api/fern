export interface ParsedDockerName {
    name: string;
    version: string;
}

export function parseDockerOrThrow(docker: string): ParsedDockerName {
    const dockerArray: string[] = docker.split(":");
    if (dockerArray.length === 2 && dockerArray[0] != null && dockerArray[1] != null) {
        return {
            name: dockerArray[0],
            version: dockerArray[1]
        };
    }
    throw new Error(`Received invalid docker name ${docker}. Must be formatted as <name>:<version>`);
}
