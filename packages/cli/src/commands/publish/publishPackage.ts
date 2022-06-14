import { PublishRegistry } from "@fern-api/commons";

export declare namespace publishPackage {
    export interface Args {
        absolutePathToOutput: string;
        registry: PublishRegistry;
        version: string | undefined;
    }
}

export function publishPackage({ absolutePathToOutput, registry, version }: publishPackage.Args): void {
    console.log(`Publishing ${absolutePathToOutput} to ${registry} with version ${version}`);
}
