import { Environment, EnvironmentId } from "@fern-fern/ir-model/environment";
import { GeneratedEnvironments } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedEnvironmentsImpl } from "./GeneratedEnvironmentsImpl";

export declare namespace EnvironmentsGenerator {
    export namespace generateEnvironments {
        export interface Args {
            environments: Environment[];
            environmentEnumName: string;
            defaultEnvironment: EnvironmentId | undefined;
        }
    }
}

export class EnvironmentsGenerator {
    public generateEnvironments({
        environmentEnumName,
        environments,
        defaultEnvironment,
    }: EnvironmentsGenerator.generateEnvironments.Args): GeneratedEnvironments {
        return new GeneratedEnvironmentsImpl({ environmentEnumName, environments, defaultEnvironment });
    }
}
