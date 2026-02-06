import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedEnvironments } from "@fern-typescript/contexts";

import { EmptyGeneratedEnvironmentsImpl } from "./EmptyGeneratedEnvironmentsImpl.js";
import { GeneratedMultipleUrlsEnvironmentsImpl } from "./GeneratedMultipleUrlsEnvironmentsImpl.js";
import { GeneratedSingleUrlEnvironmentsImpl } from "./GeneratedSingleUrlEnvironmentsImpl.js";

export declare namespace EnvironmentsGenerator {
    export namespace generateEnvironments {
        export interface Args {
            environmentsConfig: FernIr.EnvironmentsConfig | undefined;
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
        return FernIr.Environments._visit<GeneratedEnvironments>(environmentsConfig.environments, {
            singleBaseUrl: (singleBaseUrlEnvironments) =>
                new GeneratedSingleUrlEnvironmentsImpl({
                    environments: singleBaseUrlEnvironments,
                    environmentEnumName,
                    defaultEnvironmentId: environmentsConfig.defaultEnvironment ?? undefined
                }),
            multipleBaseUrls: (multipleBaseUrlEnvironments) =>
                new GeneratedMultipleUrlsEnvironmentsImpl({
                    environments: multipleBaseUrlEnvironments,
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
