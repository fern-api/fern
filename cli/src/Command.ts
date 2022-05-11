import { IntermediateRepresentation } from "@fern-api/api";
import { HelperManager } from "@fern-typescript/helper-manager";
import { Project } from "ts-morph";

export declare namespace Command {
    export interface Args {
        project: Project;
        intermediateRepresentation: IntermediateRepresentation;
        helperManager: HelperManager;
    }
}

export interface Command {
    run: (args: Command.Args) => void | Promise<void>;
}
