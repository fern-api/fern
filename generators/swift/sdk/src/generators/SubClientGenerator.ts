import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { HttpService, PrimitiveTypeV1, ServiceId, Subpackage, TypeReference } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SubClientGenerator {
    interface Args {
        subpackage: Subpackage;
        context: SdkGeneratorContext;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class SubClientGenerator {
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

    private get subClientName() {
        return `${this.subpackage.name.pascalCase.unsafeName}Client`;
    }

    public generate(): SwiftFile {
        const swiftClass = swift.class_({
            name: this.subClientName,
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: this.generateProperties(),
            initializers: [this.generateInitializer()],
            methods: this.generateMethods()
        });
        const fileContents = swiftClass.toString();
        return new SwiftFile({
            filename: this.subpackage.name.pascalCase.safeName + ".swift",
            directory: RelativeFilePath.of("Resources"),
            fileContents
        });
    }

    private generateProperties(): swift.Property[] {
        return [
            swift.property({
                unsafeName: "httpClient",
                accessLevel: swift.AccessLevel.Private,
                declarationType: swift.DeclarationType.Let,
                type: swift.Type.custom("HTTPClient")
            })
        ];
    }

    private generateInitializer(): swift.Initializer {
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "config",
                    unsafeName: "config",
                    type: swift.Type.custom("ClientConfig")
                })
            ],
            body: swift.CodeBlock.withStatements([
                swift.Statement.propertyAssignment(
                    "httpClient",
                    swift.Expression.classInitialization("HTTPClient", [
                        swift.functionArgument({ label: "config", value: swift.Expression.reference("config") })
                    ])
                )
            ])
        });
    }

    private generateMethods(): swift.Method[] | undefined {
        return this.service?.endpoints.map((endpoint) => {
            return swift.method({
                unsafeName: endpoint.name.camelCase.unsafeName,
                accessLevel: swift.AccessLevel.Public,
                parameters: [
                    swift.functionParameter({
                        argumentLabel: "requestOptions",
                        unsafeName: "requestOptions",
                        type: swift.Type.custom("RequestOptions"),
                        optional: true,
                        defaultValue: swift.Expression.rawValue("nil")
                    })
                ],
                async: true,
                throws: true,
                returnType:
                    endpoint.response?.body?._visit({
                        json: (resp) => this.generateSwiftTypeForTypeReference(resp.responseBodyType),
                        fileDownload: () => swift.Type.custom("Any"),
                        text: () => swift.Type.custom("Any"),
                        bytes: () => swift.Type.custom("Any"),
                        streaming: () => swift.Type.custom("Any"),
                        streamParameter: () => swift.Type.custom("Any"),
                        _other: () => swift.Type.custom("Any")
                    }) ?? swift.Type.custom("Any")
            });
        });
    }

    // TODO: Needs to be reused between SubClientGenerator and ObjectGenerator
    private generateSwiftTypeForTypeReference(typeReference: TypeReference): swift.Type {
        switch (typeReference.type) {
            case "container":
                return typeReference.container._visit({
                    literal: () => swift.Type.any(),
                    map: () => swift.Type.any(),
                    set: () => swift.Type.any(),
                    nullable: () => swift.Type.any(),
                    optional: (ref) => this.generateSwiftTypeForTypeReference(ref),
                    list: (ref) => swift.Type.array(this.generateSwiftTypeForTypeReference(ref)),
                    _other: () => swift.Type.any()
                });
            case "primitive":
                return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
                    string: () => swift.Type.string(),
                    boolean: () => swift.Type.bool(),
                    integer: () => swift.Type.int(),
                    uint: () => swift.Type.uint(),
                    uint64: () => swift.Type.uint64(),
                    long: () => swift.Type.int64(),
                    float: () => swift.Type.float(),
                    double: () => swift.Type.double(),
                    bigInteger: () => swift.Type.string(),
                    date: () => swift.Type.date(),
                    dateTime: () => swift.Type.date(),
                    base64: () => swift.Type.string(),
                    uuid: () => swift.Type.uuid(),
                    _other: () => swift.Type.any()
                });
            case "named":
                return swift.Type.custom(typeReference.name.pascalCase.unsafeName);
            case "unknown":
                return swift.Type.any();
            default:
                assertNever(typeReference);
        }
    }

    private getSubpackages(): Subpackage[] {
        return this.subpackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
