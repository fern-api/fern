import { StatementStructures, WriterFunction } from "ts-morph";

export interface GeneratedStatements<Context> {
    generateStatements: (
        context: Context
    ) =>
        | string
        | WriterFunction
        | string
        | WriterFunction
        | ReadonlyArray<string | WriterFunction | StatementStructures>;
}
