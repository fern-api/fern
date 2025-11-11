import {
    AbstractAstNode,
    AbstractFormatter,
    addGlobalFunctionFilter,
    at,
    enableStackTracking,
    getFramesForTaggedObject
} from "@fern-api/browser-compatible-base-generator";
import { Generation } from "../../context/generation-info";
import { type Origin } from "../../context/model-navigator";
import { type Class } from "../types/Class";
import { type ClassReference } from "../types/ClassReference";
import { type Interface } from "../types/Interface";
import { Writer } from "./Writer";

type Namespace = string;

export interface FormattedAstNodeSnippet {
    imports: string | undefined;
    body: string;
}

// don't track stack frames for the internals of AstNode.
addGlobalFunctionFilter("AstNode");

export abstract class AstNode extends AbstractAstNode {
    constructor(public readonly generation: Generation) {
        super();
    }

    protected get csharp() {
        return this.generation.csharp;
    }
    protected get registry() {
        return this.generation.registry;
    }
    protected get settings() {
        return this.generation.settings;
    }
    protected get namespaces() {
        return this.generation.namespaces;
    }
    protected get names() {
        return this.generation.names;
    }
    protected get types() {
        return this.generation.types;
    }
    protected get extern() {
        return this.generation.extern;
    }
    protected get model() {
        return this.generation.model;
    }
    public get System() {
        return this.extern.System;
    }
    public get NUnit() {
        return this.extern.NUnit;
    }
    public get OneOf() {
        return this.extern.OneOf;
    }
    public get Google() {
        return this.extern.Google;
    }

    /**
     * Writes the node to a string.
     */
    public override toString({
        namespace,
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        formatter,
        skipImports = false
    }: {
        namespace: string;
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        generation: Generation;
        formatter?: AbstractFormatter;
        skipImports?: boolean;
    }): string {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            generation,
            skipImports
        });
        this.write(writer);
        const stringNode = writer.toString(skipImports);
        return formatter != null ? formatter.formatSync(stringNode) : stringNode;
    }
    public toStringAsync({
        namespace,
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        formatter,
        skipImports = false
    }: {
        namespace: string;
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        generation: Generation;
        formatter?: AbstractFormatter;
        skipImports?: boolean;
    }): Promise<string> {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            generation,
            skipImports
        });
        this.write(writer);
        const stringNode = writer.toString(skipImports);
        return formatter != null ? formatter.format(stringNode) : Promise.resolve(stringNode);
    }

    public toFormattedSnippet({
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        formatter,
        skipImports = false
    }: {
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        generation: Generation;
        formatter: AbstractFormatter;
        skipImports: boolean;
    }): FormattedAstNodeSnippet {
        const writer = new Writer({
            namespace: "",
            allNamespaceSegments,
            allTypeClassReferences,
            generation,
            skipImports
        });
        this.write(writer);
        return {
            imports: writer.importsToString(),
            body: formatter.formatSync(writer.buffer)
        };
    }

    public async toFormattedSnippetAsync({
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        formatter,
        skipImports = false
    }: {
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        generation: Generation;
        formatter: AbstractFormatter;
        skipImports?: boolean;
    }): Promise<FormattedAstNodeSnippet> {
        const writer = new Writer({
            namespace: "",
            allNamespaceSegments,
            allTypeClassReferences,
            generation,
            skipImports
        });
        this.write(writer);
        return {
            imports: writer.importsToString(),
            body: await formatter.format(writer.buffer)
        };
    }

    public get debugInfo(): string {
        return enableStackTracking
            ? `Debug Info:\n    at:\n    ${at({ multiline: true }).replaceAll("\n", "\n    ")}\n    creation stack:\n${getFramesForTaggedObject(
                  this
              )
                  .map((each) => `    ${each.fn} - ${each.path}:${each.position}`)
                  .join("\n")}`
            : "";
    }
}

export namespace Node {
    export interface Args {
        origin?: Origin;
    }
}

export abstract class Node extends AstNode {
    public readonly origin?: Origin;
    constructor(origin: Origin | undefined, generation: Generation) {
        super(generation);
        this.origin = this.model.origin(origin);
    }
}

export namespace MemberNode {
    export interface Args extends Node.Args {
        enclosingType?: Class | Interface | ClassReference;
    }
}
//
export abstract class MemberNode extends Node {
    public readonly enclosingType?: Class | Interface | ClassReference;

    constructor(args: MemberNode.Args, origin: Origin | undefined, generation: Generation) {
        super(origin, generation);
        this.enclosingType = args.enclosingType;
    }
}
