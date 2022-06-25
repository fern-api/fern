import { IntermediateRepresentation } from "@fern-api/api";
import { HelperManager } from "@fern-typescript/helper-manager";
import { Volume } from "memfs/lib/volume";

export const CommandKey = {
    Server: "server",
    Client: "client",
    Model: "model",
} as const;

export declare namespace Command {
    export interface Args {
        packageName: string;
        packageVersion: string | undefined;
        volume: Volume;
        intermediateRepresentation: IntermediateRepresentation;
        helperManager: HelperManager;
    }
}

export interface Command<K extends string> {
    key: K;
    generate: (args: Command.Args) => void | Promise<void>;
}
