import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Type } from "./Type";

export declare namespace PaginatedMethod {
    interface Args {
        name: string;
        parameters: string[];
        itemType: Type;
        paginationType: "cursor" | "offset" | "custom";
        isAsync: boolean;
        httpMethod: string;
        pathExpression: string;
        body: string; // Pre-generated method body
    }
}

export class PaginatedMethod extends AstNode {
    constructor(private readonly args: PaginatedMethod.Args) {
        super();
    }

    public write(writer: Writer): void {
        if (this.args.isAsync) {
            this.writeAsyncMethod(writer);
        } else {
            this.writeSyncMethod(writer);
        }
    }

    private writeAsyncMethod(writer: Writer): void {
        const { name, parameters, itemType } = this.args;
        const paginatorType = `AsyncPaginator<${itemType.toString()}>`;

        writer.writeLine(
            `pub async fn ${name}_paginated(&self, ${parameters.join(", ")}) -> Result<${paginatorType}, ClientError> {`
        );
        writer.indent();
        writer.writeLine(this.args.body);
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("");
    }

    private writeSyncMethod(writer: Writer): void {
        const { name, parameters, itemType } = this.args;
        const paginatorType = `SyncPaginator<${itemType.toString()}>`;

        writer.writeLine(
            `pub fn ${name}_paginated_sync(&self, ${parameters.join(", ")}) -> Result<${paginatorType}, ClientError> {`
        );
        writer.indent();
        writer.writeLine(this.args.body);
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("");
    }
}
