import {
    ErrorDeclarationSchema,
    ExampleEndpointCallSchema,
    ExampleTypeSchema,
    HttpEndpointSchema,
    HttpHeaderSchema,
    HttpPathParameterSchema,
    HttpQueryParameterSchema,
    HttpServiceSchema,
    TypeDeclarationSchema,
} from "../schemas";
import { NodePath } from "./NodePath";

export type FernServiceFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof FernServiceFileAstNodeTypes]: FernServiceFileAstNodeVisitor<K, R>;
};

export interface FernServiceFileAstNodeTypes {
    docs: string;
    import: { importPath: string; importedAs: string };
    typeDeclaration: { typeName: string; declaration: TypeDeclarationSchema };
    exampleType: { typeName: string; typeDeclaration: TypeDeclarationSchema; example: ExampleTypeSchema };
    typeReference: string;
    typeName: string;
    httpService: { serviceName: string; service: HttpServiceSchema };
    httpEndpoint: { endpointId: string; endpoint: HttpEndpointSchema; service: HttpServiceSchema };
    exampleHttpEndpointCall: {
        endpointId: string;
        endpoint: HttpEndpointSchema;
        service: HttpServiceSchema;
        example: ExampleEndpointCallSchema;
    };
    pathParameter: { pathParameterKey: string; pathParameter: HttpPathParameterSchema };
    queryParameter: { queryParameterKey: string; queryParameter: HttpQueryParameterSchema };
    header: { headerKey: string; header: HttpHeaderSchema };
    errorDeclaration: { errorName: string; declaration: ErrorDeclarationSchema };
    errorReference: string;
}

export type FernServiceFileAstNodeVisitor<K extends keyof FernServiceFileAstNodeTypes, R = void | Promise<void>> = (
    node: FernServiceFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
