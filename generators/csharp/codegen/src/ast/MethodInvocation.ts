import { NamedArgument } from "@fern-api/browser-compatible-base-generator";

import { csharp } from "..";
import { AnonymousFunction } from "../csharp";
import { ClassInstantiation } from "./ClassInstantiation";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace MethodInvocation {
    interface Args {
        /* Defaults to false */
        async?: boolean;
        /*
        How to call configureAwait(false/true) when async is true.
        Defaults to `false`, which adds `configureAwait(false)`.
        If true, nothing is added, as the default it `configureAwait(true)`.
        */
        configureAwait?: boolean;
        /* The method to invoke */
        method: string;
        /* A map of the field for the class and the value to be assigned to it. */
        arguments_: AstNode[];
        /* In the event of an instance method, you'll want to invoke it on said instance */
        on?: AstNode;
        /* Any generics used in the method invocation */
        generics?: csharp.Type[];
        /* Whether to use a multiline method invocation */
        multiline?: boolean;
    }
}

export class MethodInvocation extends AstNode {
    private arguments: AstNode[];
    private method: string;
    private on: AstNode | undefined;
    private async: boolean;
    private configureAwait: boolean;
    private generics: csharp.Type[];
    private multiline: boolean;

    constructor({ method, arguments_, on, async, configureAwait, generics, multiline }: MethodInvocation.Args) {
        super();

        this.method = method;
        this.arguments = arguments_;
        this.on = on;
        this.async = async ?? false;
        this.configureAwait = configureAwait ?? false;
        this.generics = generics ?? [];
        this.multiline = multiline ?? false;
    }

    public write(writer: Writer): void {
        if (this.async) {
            writer.write("await ");
        }
        if (this.on) {
            this.on.write(writer);
            writer.write(".");
        }
        writer.write(this.method);
        if (this.generics != null && this.generics.length > 0) {
            writer.write("<");
            this.generics.forEach((generic, idx) => {
                writer.writeNode(generic);
                if (idx < this.generics.length - 1) {
                    writer.write(", ");
                }
            });
            writer.write(">");
        }
        writer.write("(");
        if (this.arguments.length === 0) {
            writer.write(")");
            this.writeEnd(writer);
            return;
        }
        if (this.multiline) {
            writer.newLine();
            writer.indent();
        }
        this.arguments.forEach((arg, idx) => {
            arg.write(writer);
            if (idx < this.arguments.length - 1) {
                writer.write(",");
                if (!this.multiline) {
                    writer.write(" ");
                }
            }
            if (this.multiline) {
                writer.newLine();
            }
        });
        if (this.multiline) {
            writer.dedent();
        }
        writer.write(")");
        this.writeEnd(writer);
    }

    private writeEnd(writer: Writer): void {
        if (this.async && this.configureAwait === false) {
            writer.write(".ConfigureAwait(false)");
        }
    }
}
