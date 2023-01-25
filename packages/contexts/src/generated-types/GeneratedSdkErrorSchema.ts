import { ts } from "ts-morph";
import { SdkErrorSchemaContext } from "../contexts/SdkErrorSchemaContext";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedSdkErrorSchema extends GeneratedFile<SdkErrorSchemaContext> {
    getReferenceToRawShape: (context: SdkErrorSchemaContext) => ts.TypeNode;
}
