import { GeneratedEnvironments } from "@fern-typescript/contexts";

import { Environments, EnvironmentsConfig } from "@fern-fern/ir-sdk/api";

import { EmptyGeneratedEnvironmentsImpl } from "./EmptyGeneratedEnvironmentsImpl";
import { GeneratedMultipleUrlsEnvironmentsImpl } from "./GeneratedMultipleUrlsEnvironmentsImpl";
import { GeneratedSingleUrlEnvironmentsImpl } from "./GeneratedSingleUrlEnvironmentsImpl";

export declare namespace EnvironmentsGenerator {
    export namespace generateEnvironments {
        export interface Args {
            environmentsConfig: EnvironmentsConfig | undefined;
            environmentEnumName: string;
            environmentUrlsTypeName: string;
        }
    }
}

export class EnvironmentsGenerator {
    public generateEnvironments({
        environmentEnumName,
        environmentUrlsTypeName,
        environmentsConfig
    }: EnvironmentsGenerator.generateEnvironments.Args): GeneratedEnvironments {
        if (
            environmentsConfig == null ||
            environmentsConfig.environments == null ||
            environmentsConfig.environments._visit({
                singleBaseUrl: (value) => {
                    return value.environments.length === 0;
                },
                multipleBaseUrls: (value) => {
                    return value.environments.length === 0;
                },
                _other: () => {
                    return true;
                }
            })
        ) {
            return new EmptyGeneratedEnvironmentsImpl();
        }
        return Environments._visit<GeneratedEnvironments>(environmentsConfig.environments, {
            singleBaseUrl: (singleBaseUrlEnvironments) =>
                new GeneratedSingleUrlEnvironmentsImpl({
                    environments: singleBaseUrlEnvironments,
                    environmentEnumName,
                    defaultEnvironmentId: environmentsConfig.defaultEnvironment ?? undefined
                }),
            multipleBaseUrls: (mulitpleBaseUrlEnvironments) =>
                new GeneratedMultipleUrlsEnvironmentsImpl({
                    environments: mulitpleBaseUrlEnvironments,
                    environmentEnumName,
                    environmentUrlsTypeName,
                    defaultEnvironmentId: environmentsConfig.defaultEnvironment ?? undefined
                }),
            _other: () => {
                throw new Error("Unknown environments: " + environmentsConfig.environments.type);
            }
        });
    }
}
