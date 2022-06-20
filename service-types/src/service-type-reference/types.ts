import { TypeReference } from "@fern-api/api";
import { SourceFile } from "ts-morph";
import { ServiceTypesConstants } from "../constants";

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
    | typeof ServiceTypesConstants.Types.Request.TYPE_NAME
    | typeof ServiceTypesConstants.Types.Request.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Types.Response.TYPE_NAME
    | typeof ServiceTypesConstants.Types.Response.Success.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Types.Response.Error.Properties.Body.TYPE_NAME;
