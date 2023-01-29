import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { SdkErrorSchemaContext } from "./SdkErrorSchemaContext";

export interface GeneratedSdkErrorSchema extends GeneratedFile<SdkErrorSchemaContext> {
    deserializeBody: (context: SdkErrorSchemaContext, args: { referenceToBody: ts.Expression }) => ts.Expression;
}
