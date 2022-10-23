import {
    ErrorDeclarationSchema,
    HttpEndpointSchema,
    HttpQueryParameterSchema,
    HttpServiceSchema,
    TypeDeclarationSchema,
    TypeReferenceSchema,
} from "../schemas";
import { NodePath } from "./NodePath";

export type FernAstVisitor<R = void | Promise<void>> = {
    [K in keyof FernAstNodeTypes]: FernAstNodeVisitor<K, R>;
};

export interface FernAstNodeTypes {
    defaultEnvironment: string | null | undefined;
    docs: string;
    import: { importPath: string; importedAs: string };
    typeDeclaration: { typeName: string; declaration: TypeDeclarationSchema };
    typeReference: TypeReferenceSchema;
    typeName: string;
    httpService: { serviceName: string; service: HttpServiceSchema };
    httpEndpoint: { endpointId: string; endpoint: HttpEndpointSchema };
    queryParameter: { queryParameterKey: string; queryParameter: HttpQueryParameterSchema };
    errorDeclaration: { errorName: string; declaration: ErrorDeclarationSchema };
    errorReference: string;
}

export type FernAstNodeVisitor<K extends keyof FernAstNodeTypes, R = void | Promise<void>> = (
    node: FernAstNodeTypes[K],
    nodePath: NodePath
) => R;
