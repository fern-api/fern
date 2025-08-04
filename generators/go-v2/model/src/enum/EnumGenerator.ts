import { GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { AbstractModelGenerator } from "../AbstractModelGenerator";

const STRING_VALUE_PARAM_NAME = "s";
const TYPE_PARAMETER_NAME = "t";

export class EnumGenerator extends AbstractModelGenerator {
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
    ) {
        super(context, typeDeclaration);
    }

    protected doGenerate(): GoFile {
        const enum_ = go.enum_({
            ...this.typeReference,
            docs: this.typeDeclaration.docs
        });
        const members: go.Enum.Member[] = this.getMembers();
        for (const member of members) {
            enum_.addMember(member);
        }
        enum_.addConstructor(this.getConstructor({ typeReference: this.typeReference, members }));
        enum_.addMethod(this.getPtrMethod());
        return this.toFile(enum_);
    }

    private getMembers(): go.Enum.Member[] {
        return this.enumDeclaration.values.map((value) => ({
            name: this.context.getClassName(value.name.name),
            value: value.name.wireValue,
            docs: value.docs
        }));
    }

    private getConstructor({
        typeReference,
        members
    }: {
        typeReference: go.TypeReference;
        members: go.Enum.Member[];
    }): go.Func {
        const switch_ = go.switch_({
            on: go.identifier(STRING_VALUE_PARAM_NAME),
            cases: members.map((member) => ({
                on: go.TypeInstantiation.string(member.value),
                body: go.codeblock((writer) => {
                    writer.write(`return `);
                    writer.writeNode(go.Enum.getMemberIdentifier({ name: typeReference.name, member }));
                    writer.writeLine(", nil");
                })
            }))
        });
        return go.func({
            name: this.getConstructorName(),
            parameters: [go.parameter({ name: STRING_VALUE_PARAM_NAME, type: go.Type.string() })],
            return_: [go.Type.reference(this.typeReference), go.Type.error()],
            body: go.codeblock((writer) => {
                writer.writeNode(switch_);
                writer.newLine();
                writer.writeLine(`var ${TYPE_PARAMETER_NAME} ${typeReference.name}`);
                writer.write('return "", ');
                writer.writeNode(
                    this.context.callFmtErrorf("%s is not a valid %T", [
                        go.identifier(STRING_VALUE_PARAM_NAME),
                        go.identifier(TYPE_PARAMETER_NAME)
                    ])
                );
                writer.newLine();
            }),
            multiline: false
        });
    }

    private getConstructorName(): string {
        return `New${this.typeReference.name}FromString`;
    }

    private getPtrMethod(): go.Method {
        const receiver = this.context.getReceiverName(this.typeDeclaration.name.name);
        return go.method({
            typeReference: this.typeReference,
            name: "Ptr",
            parameters: [],
            return_: [go.Type.pointer(go.Type.reference(this.typeReference))],
            body: go.codeblock((writer) => {
                writer.write(`return &${receiver}`);
            }),
            receiver
        });
    }
}
