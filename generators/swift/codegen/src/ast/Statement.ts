import { assertNever } from "@fern-api/core-utils"

import { DeclarationType } from "./DeclarationType"
import { Expression } from "./Expression"
import { AstNode, Writer } from "./core"
import { escapeReservedKeyword } from "./syntax/reserved-keywords"

type ConstantDeclaration = {
    type: "constant-declaration"
    unsafeName: string
    value: Expression
}

type VariableDeclaration = {
    type: "variable-declaration"
    unsafeName: string
    value: Expression
}

type VariableAssignment = {
    type: "variable-assignment"
    unsafeName: string
    value: Expression
}

type PropertyAssignment = {
    type: "property-assignment"
    unsafeName: string
    value: Expression
}

type Return = {
    type: "return"
    expression: Expression
}

type InternalStatement = ConstantDeclaration | VariableDeclaration | VariableAssignment | PropertyAssignment | Return

export class Statement extends AstNode {
    private internalStatement: InternalStatement

    private constructor(internalStatement: InternalStatement) {
        super()
        this.internalStatement = internalStatement
    }

    public write(writer: Writer): void {
        switch (this.internalStatement.type) {
            case "constant-declaration":
                writer.write(DeclarationType.Let)
                writer.write(" ")
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName))
                writer.write(" = ")
                this.internalStatement.value.write(writer)
                writer.newLine()
                break
            case "variable-declaration":
                writer.write(DeclarationType.Var)
                writer.write(" ")
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName))
                writer.write(" = ")
                this.internalStatement.value.write(writer)
                writer.newLine()
                break
            case "variable-assignment":
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName))
                writer.write(" = ")
                this.internalStatement.value.write(writer)
                writer.newLine()
                break
            case "property-assignment":
                writer.write("self.")
                writer.write(this.internalStatement.unsafeName)
                writer.write(" = ")
                this.internalStatement.value.write(writer)
                writer.newLine()
                break
            case "return":
                writer.write("return ")
                this.internalStatement.expression.write(writer)
                writer.newLine()
                break
            default:
                assertNever(this.internalStatement)
        }
    }

    public static constantDeclaration(unsafeName: string, value: Expression): Statement {
        return new this({ type: "constant-declaration", unsafeName, value })
    }

    public static variableDeclaration(unsafeName: string, value: Expression): Statement {
        return new this({ type: "variable-declaration", unsafeName, value })
    }

    public static variableAssignment(unsafeName: string, value: Expression): Statement {
        return new this({ type: "variable-assignment", unsafeName, value })
    }

    public static propertyAssignment(unsafeName: string, value: Expression): Statement {
        return new this({ type: "property-assignment", unsafeName, value })
    }

    public static return(expression: Expression): Statement {
        return new this({ type: "return", expression })
    }
}
