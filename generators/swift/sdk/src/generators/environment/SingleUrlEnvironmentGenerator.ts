import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { SingleBaseUrlEnvironments } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        environments: SingleBaseUrlEnvironments;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class SingleUrlEnvironmentGenerator {
    private readonly environments: SingleBaseUrlEnvironments;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({ environments, sdkGeneratorContext }: SingleUrlEnvironmentGenerator.Args) {
        this.environments = environments;
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    public generate(): SwiftFile {
        const swiftEnum = swift.enumWithRawValues({
            name: this.sdkGeneratorContext.environmentEnumName,
            accessLevel: swift.AccessLevel.Public,
            conformances: ["String", swift.Protocol.CaseIterable],
            cases: this.environments.environments.map((e) => ({
                unsafeName: e.name.camelCase.unsafeName,
                rawValue: e.url
            }))
        });
        const fileContents = swiftEnum.toString();
        return new SwiftFile({
            filename: `${this.sdkGeneratorContext.environmentEnumName}.swift`,
            directory: RelativeFilePath.of(""),
            fileContents
        });
    }
}
