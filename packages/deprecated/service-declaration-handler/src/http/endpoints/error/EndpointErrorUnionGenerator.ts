import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { AbstractUnionGenerator, ParsedSingleUnionType } from "@fern-typescript/types-v2";
import { ts } from "ts-morph";
import { EndpointError } from "./EndpointError";
import { ParsedSingleUnionTypeForError } from "./ParsedSingleUnionTypeForError";

export declare namespace EndpointErrorUnionGenerator {
    export interface Init {
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;
        file: SdkFile;
    }
}

export declare namespace EndpointErrorUnionGenerator {
    export interface Init {
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;
    }
}

export class EndpointErrorUnionGenerator extends AbstractUnionGenerator {
    public static UNKNOWN_ERROR_PROPERTY_NAME = "content";

    private parsedErrors: ParsedSingleUnionType[];
    private serviceName: DeclaredServiceName;
    private endpoint: HttpEndpoint;

    constructor({ endpoint, serviceName }: EndpointErrorUnionGenerator.Init) {
        const parsedErrors = endpoint.errorsV2.types.map(
            (error) => new ParsedSingleUnionTypeForError({ errors: endpoint.errorsV2, error })
        );

        super({
            typeName: EndpointError.TYPE_NAME,
            discriminant: endpoint.errorsV2.discriminant,
            docs: undefined,
            parsedSingleUnionTypes: parsedErrors,
            getReferenceToUnion: (file) =>
                file.getReferenceToEndpointFileExport(serviceName, endpoint, EndpointError.TYPE_NAME),
            unknownSingleUnionType: {
                discriminantType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                getVisitorArgument: (file) => file.coreUtilities.fetcher.Fetcher.Error._getReferenceToType(),
                getNonDiscriminantProperties: (file) => [
                    {
                        name: EndpointErrorUnionGenerator.UNKNOWN_ERROR_PROPERTY_NAME,
                        type: getTextOfTsNode(file.coreUtilities.fetcher.Fetcher.Error._getReferenceToType()),
                    },
                ],
            },
        });

        this.parsedErrors = parsedErrors;
        this.serviceName = serviceName;
        this.endpoint = endpoint;
    }

    protected override getReferenceToUnionType(file: SdkFile): Reference {
        return EndpointError.getReferenceTo(file, {
            serviceName: this.serviceName,
            endpoint: this.endpoint,
        });
    }

    public getErrors(): ParsedSingleUnionType[] {
        return [...this.parsedErrors];
    }

    protected override shouldWriteSchema(): boolean {
        return this.parsedErrors.length > 0;
    }

    protected override shouldIncludeDefaultCaseInSchemaTransform(): boolean {
        return false;
    }
}
