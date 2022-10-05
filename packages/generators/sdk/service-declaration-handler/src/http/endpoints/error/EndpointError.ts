import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ParsedSingleUnionType } from "@fern-typescript/types-v2";
import { AbstractSchemaGenerator } from "@fern-typescript/types-v2/src/AbstractSchemaGenerator";
import { ts } from "ts-morph";
import { AbstractEndpointDeclaration } from "../AbstractEndpointDeclaration";
import { EndpointErrorUnionGenerator } from "./EndpointErrorUnionGenerator";

export declare namespace EndpointError {
    export interface Init extends AbstractEndpointDeclaration.Init {
        file: SdkFile;
    }
}

export class EndpointError extends AbstractEndpointDeclaration {
    public static TYPE_NAME = "Error";

    private unionGenerator: EndpointErrorUnionGenerator;

    constructor({ file, ...init }: EndpointError.Init) {
        super(init);
        this.unionGenerator = new EndpointErrorUnionGenerator({
            serviceName: this.service.name,
            endpoint: this.endpoint,
            file,
        });
    }

    public generate({ endpointFile, schemaFile }: { endpointFile: SdkFile; schemaFile: SdkFile }): void {
        this.unionGenerator.generate({ typeFile: endpointFile, schemaFile });
    }

    public static getReferenceToType(
        file: SdkFile,
        { serviceName, endpoint }: { serviceName: DeclaredServiceName; endpoint: HttpEndpoint }
    ): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            AbstractEndpointDeclaration.getReferenceToEndpointFileType({
                typeName: EndpointError.TYPE_NAME,
                file,
                serviceName,
                endpoint,
            })
        );
    }

    public getErrors(): ParsedSingleUnionType[] {
        return this.unionGenerator.getErrors();
    }

    public getReferenceToSchema(file: SdkFile): Zurg.Schema {
        return file.coreUtilities.zurg.Schema._fromExpression(
            ts.factory.createPropertyAccessExpression(
                file.getReferenceToEndpointSchemaFile(this.service.name, this.endpoint).expression,
                EndpointError.TYPE_NAME
            )
        );
    }

    public getReferenceToType(file: SdkFile): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                file.getReferenceToEndpointFile(this.service.name, this.endpoint).entityName,
                EndpointError.TYPE_NAME
            )
        );
    }

    public getReferenceToRawType(file: SdkFile): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    file.getReferenceToEndpointSchemaFile(this.service.name, this.endpoint).entityName,
                    EndpointError.TYPE_NAME
                ),
                AbstractSchemaGenerator.RAW_TYPE_NAME
            )
        );
    }
}
