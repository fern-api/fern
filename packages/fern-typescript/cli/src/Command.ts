import { IntermediateRepresentation } from "@fern-api/api";
import { HelperManager } from "@fern-typescript/helper-manager";
import { Volume } from "memfs/lib/volume";

export declare namespace Command {
    export interface Args {
        packageName: string;
        packageVersion: string;
        volume: Volume;
        intermediateRepresentation: IntermediateRepresentation;
        helperManager: HelperManager;
    }
}

export interface Command {
    run: (args: Command.Args) => void | Promise<void>;
}
