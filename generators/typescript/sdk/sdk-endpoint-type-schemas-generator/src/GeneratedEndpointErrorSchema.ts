import { Zurg } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface GeneratedEndpointErrorSchema {
    writeToFile(context: FileContext): void;
    getReferenceToRawShape(context: FileContext): ts.TypeNode;
    getReferenceToZurgSchema(context: FileContext): Zurg.Schema;
}
