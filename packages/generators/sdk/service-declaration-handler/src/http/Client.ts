import { HttpService } from "@fern-fern/ir-model/services/http";
import { getTextOfTsKeyword, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { Scope, ts } from "ts-morph";
import { Endpoint } from "./endpoints/Endpoint";

export declare namespace Client {
    export interface Init {
        service: HttpService;
        serviceClassName: string;
    }
}

export class Client {
    private static OPTIONS_INTERFACE_NAME = "Options";
    private static OPTIONS_PRIVATE_MEMBER = "options";
    public static ORIGIN_OPTIONS_PROPERTY_NAME = "_origin";

    private service: HttpService;
    private serviceClassName: string;

    constructor({ service, serviceClassName }: Client.Init) {
        this.service = service;
        this.serviceClassName = serviceClassName;
    }

    public generate(file: SdkFile, endpoints: Endpoint[]): void {
        const serviceInterface = file.sourceFile.addInterface({
            name: this.serviceClassName,
            isExported: true,
        });

        const serviceModule = file.sourceFile.addModule({
            name: serviceInterface.getName(),
            isExported: true,
            hasDeclareKeyword: true,
        });

        const optionsInterface = serviceModule.addInterface({
            name: Client.OPTIONS_INTERFACE_NAME,
            properties: [
                {
                    name: Client.ORIGIN_OPTIONS_PROPERTY_NAME,
                    type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
                },
            ],
        });

        optionsInterface.addProperties(file.authSchemes.getProperties());

        const serviceClass = file.sourceFile.addClass({
            name: serviceInterface.getName(),
            implements: [serviceInterface.getName()],
            isExported: true,
        });
        maybeAddDocs(serviceClass, this.service.docs);

        serviceClass.addConstructor({
            parameters: [
                {
                    name: Client.OPTIONS_PRIVATE_MEMBER,
                    isReadonly: true,
                    scope: Scope.Private,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(serviceModule.getName()),
                                ts.factory.createIdentifier(optionsInterface.getName())
                            )
                        )
                    ),
                },
            ],
        });

        for (const endpoint of endpoints) {
            serviceInterface.addMethod(endpoint.getSignature(file));
            serviceClass.addMethod(endpoint.getImplementation(file));
        }
    }

    public static getAuthHeaders(file: SdkFile): ts.ObjectLiteralElementLike[] {
        return file.authSchemes.getHeaders(this.getReferenceToOptions());
    }

    public static getReferenceToOrigin(): ts.Expression {
        return this.getReferenceToOption(Client.ORIGIN_OPTIONS_PROPERTY_NAME);
    }

    private static getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(ts.factory.createThis(), Client.OPTIONS_PRIVATE_MEMBER);
    }

    private static getReferenceToOption(option: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToOptions(), option);
    }
}
