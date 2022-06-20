import { TypeReference } from "@fern-api/api";
import { SourceFile } from "ts-morph";
import { ServiceTypesConstants } from "../../constants";

export type ServiceTypeReference = LocalServiceTypeReference | ModelServiceTypeReference;

export interface LocalServiceTypeReference {
    // is located in a file local to this service, not imported from the model
    isLocal: true;
    typeName: ServiceTypeName;
    file: SourceFile;
}

export interface ModelServiceTypeReference {
    // is imported from the model
    isLocal: false;
    typeReference: Exclude<TypeReference, TypeReference.Void>;
}

export type ServiceTypeName =
    | typeof ServiceTypesConstants.Commons.Request.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME;
