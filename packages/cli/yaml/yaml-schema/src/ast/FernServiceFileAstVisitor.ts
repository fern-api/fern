import {
    ErrorDeclarationSchema,
    HttpEndpointSchema,
    HttpQueryParameterSchema,
    HttpServiceSchema,
    TypeDeclarationSchema,
    TypeExampleSchema,
    TypeReferenceSchema,
} from "../schemas";
import { NodePath } from "./NodePath";

export type FernServiceFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof FernServiceFileAstNodeTypes]: FernServiceFileAstNodeVisitor<K, R>;
};

export interface FernServiceFileAstNodeTypes {
    docs: string;
    import: { importPath: string; importedAs: string };
    typeDeclaration: { typeName: string; declaration: TypeDeclarationSchema };
    typeExample: { typeName: string; typeDeclaration: TypeDeclarationSchema; example: TypeExampleSchema };
    typeReference: TypeReferenceSchema;
    typeName: string;
    httpService: { serviceName: string; service: HttpServiceSchema };
    httpEndpoint: { endpointId: string; endpoint: HttpEndpointSchema };
    queryParameter: { queryParameterKey: string; queryParameter: HttpQueryParameterSchema };
    errorDeclaration: { errorName: string; declaration: ErrorDeclarationSchema };
    errorReference: string;
}

export type FernServiceFileAstNodeVisitor<K extends keyof FernServiceFileAstNodeTypes, R = void | Promise<void>> = (
    node: FernServiceFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
