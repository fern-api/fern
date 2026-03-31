import { swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        enumName: string;
        environments: FernIr.SingleBaseUrlEnvironments;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class SingleUrlEnvironmentGenerator {
    private readonly enumName: string;
    private readonly environments: FernIr.SingleBaseUrlEnvironments;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({ enumName, environments, sdkGeneratorContext }: SingleUrlEnvironmentGenerator.Args) {
        this.enumName = enumName;
        this.environments = environments;
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    public generate(): swift.EnumWithRawValues {
        return swift.enumWithRawValues({
            name: this.enumName,
            accessLevel: swift.AccessLevel.Public,
            conformances: ["String", swift.Protocol.CaseIterable],
            cases: this.environments.environments.map((e) => ({
                unsafeName: e.name.camelCase.unsafeName,
                rawValue: e.url,
                docs: e.docs ? swift.docComment({ summary: e.docs }) : undefined
            }))
        });
    }
}
