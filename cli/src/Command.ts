import { IntermediateRepresentation } from "@fern-api/api";
import { Project } from "ts-morph";

export declare namespace Command {
    export interface Args {
        project: Project;
        intermediateRepresentation: IntermediateRepresentation;
    }
}

export interface Command {
    run: (args: Command.Args) => void;
}
