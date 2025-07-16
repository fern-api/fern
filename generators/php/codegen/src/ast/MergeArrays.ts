import { AbstractAstNode } from "@fern-api/browser-compatible-base-generator"

import { codeblock } from "../php"
import { AstNode } from "./core/AstNode"
import { Writer } from "./core/Writer"
import { writeArguments } from "./utils/writeArguments"

export declare namespace MergeArrays {
    export type Arg =
        | string
        | AstNode
        | {
              ref: string | AstNode
              fallback: string
          }
    export type Args = Arg[]
}

export class MergeArrays extends AstNode {
    public readonly arrays: (
        | string
        | AstNode
        | {
              ref: string | AstNode
              fallback: string | AstNode
          }
    )[]

    constructor(arrays: MergeArrays.Args) {
        super()
        this.arrays = arrays
    }

    public write(writer: Writer): void {
        writer.write("array_merge")
        writeArguments({
            writer,
            arguments_: this.arrays.map<AbstractAstNode>((array) => {
                return codeblock((writer: Writer) => {
                    if (typeof array === "string" || array instanceof AstNode) {
                        writer.writeNodeOrString(array)
                        return
                    }
                    writer.writeNodeOrString(array.ref)
                    if (array.fallback) {
                        writer.write(" ?? ")
                        writer.writeNodeOrString(array.fallback)
                    }
                })
            })
        })
    }
}
