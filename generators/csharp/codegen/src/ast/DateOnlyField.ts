import { csharp } from "..";
import { DateTypeOption } from "../custom-config/DateTypeOption";
import { Access } from "./Access";
import { Field } from "./Field";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export class DateOnlyField extends AstNode {
    private readonly dateTypeOption: DateTypeOption;
    private readonly fieldArgs: Field.Args;
    public readonly name: string;
    public readonly access: Access | undefined;
    public readonly type: Type;
    constructor({ dateTypeOption, ...fieldArgs }: DateOnlyField.Args) {
        super();
        this.dateTypeOption = dateTypeOption;
        this.fieldArgs = fieldArgs;
        this.name = fieldArgs.name;
        this.access = fieldArgs.access;
        this.type = fieldArgs.type;
    }

    public write(writer: Writer): void {
        const dateTimeField = new Field({
            ...this.fieldArgs,
            type: this.type.cloneOptionalWithUnderlyingType(csharp.Type.dateTime())
        });
        switch (this.dateTypeOption) {
            case DateTypeOption.USE_DATE_TIME:
                writer.writeNode(dateTimeField);
                return;
            case DateTypeOption.USE_DATE_ONLY_ON_NET6_PLUS: {
                writer.writeLine("#if NET6_0_OR_GREATER");
                const dateOnlyField = new Field({
                    ...this.fieldArgs,
                    type: this.type.cloneOptionalWithUnderlyingType(csharp.Type.dateOnly())
                });
                writer.writeNode(dateOnlyField);
                writer.writeLine();
                writer.writeLine("#else");
                writer.writeNode(dateTimeField);
                writer.writeLine();
                writer.writeLine("#endif");
                return;
            }
            case DateTypeOption.USE_DATE_ONLY_PORTABLE: {
                const dateOnlyFieldPortable = new Field({
                    ...this.fieldArgs,
                    type: this.type.cloneOptionalWithUnderlyingType(csharp.Type.dateOnly())
                });
                writer.writeNode(dateOnlyFieldPortable);
                return;
            }
            default:
                throw new Error("Invalid date type");
        }
    }
}

export namespace DateOnlyField {
    export interface Args extends Field.Args {
        dateTypeOption: DateTypeOption;
    }
}
