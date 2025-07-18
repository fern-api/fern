import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SubClientGenerator {
    interface Args {
        subpackage: Subpackage;
        context: SdkGeneratorContext;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class SubPackageClientGenerator {
    private readonly subpackage: Subpackage;
    private readonly context: SdkGeneratorContext;
    private readonly serviceId?: ServiceId;
    private readonly service?: HttpService;

    public constructor({ subpackage, context, serviceId, service }: SubClientGenerator.Args) {
        this.subpackage = subpackage;
        this.context = context;
        this.serviceId = serviceId;
        this.service = service;
    }

    public generate(): SwiftFile {
        const swiftStruct = swift.struct({
            name: "ExampleStruct",
            accessLevel: swift.AccessLevel.Public,
            conformances: ["Codable", "Sendable"],
            properties: []
        });
        const fileContents = swiftStruct.toString();
        return new SwiftFile({
            filename: this.subpackage.name.pascalCase.safeName + ".swift",
            directory: RelativeFilePath.of(this.subpackage.name.pascalCase.safeName),
            fileContents
        });
    }

    private generateEndpoints(): swift.Method[] {
        return [];
    }

    private getSubpackages(): Subpackage[] {
        return this.subpackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
