import { NpmPackage } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { SdkGenerator } from "../../SdkGenerator";

export const Mocks = {
    npmPackage(partialPackage?: Partial<NpmPackage>): NpmPackage {
        return {
            packageName: "@test/sdk",
            version: "1.0.0",
            private: false,
            repoUrl: undefined,
            license: undefined,
            publishInfo: undefined,
            ...partialPackage
        };
    },
    generatorContext(): GeneratorContext {
        return {
            logger: {
                error: jest.fn(),
                info: jest.fn(),
                log: jest.fn(),
                warn: jest.fn(),
                debug: jest.fn()
            },
            fail: () => {
                throw new Error("Fail");
            }
        };
    },
    sdkConfig(partialConfig?: Partial<SdkGenerator.Config>): SdkGenerator.Config {
        return {
            whitelabel: false,
            snippetFilepath: undefined,
            shouldUseBrandedStringAliases: false,
            isPackagePrivate: false,
            neverThrowErrors: false,
            shouldBundle: false,
            outputEsm: false,
            includeCredentialsOnCrossOriginRequests: false,
            allowCustomFetcher: false,
            includeUtilsOnUnionMembers: false,
            includeOtherInUnionTypes: false,
            requireDefaultEnvironment: false,
            defaultTimeoutInSeconds: undefined,
            skipResponseValidation: false,
            targetRuntime: "node",
            extraDevDependencies: {},
            extraDependencies: {},
            treatUnknownAsAny: false,
            includeContentHeadersOnFileDownloadResponse: false,
            includeSerdeLayer: true,
            noOptionalProperties: false,
            includeApiReference: false,
            tolerateRepublish: false,
            ...partialConfig
        };
    }
};
