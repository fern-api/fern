import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { Zurg } from "@fern-typescript/commons-v2";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
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

    public static getReferenceTo(
        file: SdkFile,
        { serviceName, endpoint }: { serviceName: DeclaredServiceName; endpoint: HttpEndpoint }
    ): Reference {
        return AbstractEndpointDeclaration.getReferenceToEndpointFileExport({
            export_: EndpointError.TYPE_NAME,
            file,
            serviceName,
            endpoint,
        });
    }

    public getErrors(): ParsedSingleUnionType[] {
        return this.unionGenerator.getErrors();
    }

    public getReferenceToSchema(file: SdkFile): Zurg.Schema {
        return file.coreUtilities.zurg.Schema._fromExpression(
            file.getReferenceToEndpointSchemaFileExport(this.service.name, this.endpoint, EndpointError.TYPE_NAME)
                .expression
        );
    }

    public getReferenceTo(file: SdkFile): Reference {
        return EndpointError.getReferenceTo(file, { serviceName: this.service.name, endpoint: this.endpoint });
    }

    public getReferenceToRawType(file: SdkFile): ts.TypeNode {
        return file.getReferenceToEndpointSchemaFileExport(this.service.name, this.endpoint, [
            EndpointError.TYPE_NAME,
            AbstractSchemaGenerator.RAW_TYPE_NAME,
        ]).typeNode;
    }
}
