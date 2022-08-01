import { Values } from "@fern-api/core-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { HelperManager } from "@fern-typescript/helper-manager";
import { Volume } from "memfs/lib/volume";
import { Logger } from "../v2/client/logger/Logger";
import { NpmPackage } from "./constructNpmPackageForCommand";

export const CommandKey = {
    Server: "server",
    Client: "client",
    Model: "model",
} as const;
export type CommandKey = Values<typeof CommandKey>;

export declare namespace Command {
    export namespace generate {
        export interface Args {
            volume: Volume;
            intermediateRepresentation: IntermediateRepresentation;
            helperManager: HelperManager;
            apiName: string;
            logger: Logger;
        }
    }
}

export interface Command<K extends string> {
    key: K;
    npmPackage: NpmPackage;
    generate: (args: Command.generate.Args) => void | Promise<void>;
}
