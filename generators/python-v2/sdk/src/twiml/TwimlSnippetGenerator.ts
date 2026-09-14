import { getOriginalName } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { pythonString } from "./TwimlBuilderGenerator.js";
import { TwimlNames } from "./TwimlNames.js";

export declare namespace TwimlSnippetGenerator {
    interface Args {
        names: TwimlNames;
    }

    interface Snippet {
        /** Builder classes the snippet instantiates directly and therefore has to import. */
        imports: string[];
        /** Python statements, one per entry, without trailing `print(...)`. */
        statements: string[];
        /** Name of the variable holding the root element. */
        rootVariable: string;
    }
}

const ROOT_VARIABLE = "response";

/**
 * Turns an XML example from the IR into the builder program shown on the TwiML docs pages:
 *
 * ```python
 * response = VoiceResponse()
 * dial = Dial(caller_id="+15551112222")
 * dial.number("+15558675310")
 * response.append(dial)
 * ```
 *
 * Leaf children are attached through the parent's fluent method (`dial.number(...)`); children
 * that themselves nest elements are built standalone and `append`ed, exactly like the docs.
 */
export class TwimlSnippetGenerator {
    private readonly names: TwimlNames;

    constructor({ names }: TwimlSnippetGenerator.Args) {
        this.names = names;
    }

    public generate(example: FernIr.TwimlExample): TwimlSnippetGenerator.Snippet {
        const state: SnippetState = { imports: new Set(), statements: [], variableCounts: new Map() };
        const rootTag = this.names.getTagOrThrow(example.root.tag);
        const rootClassName = this.names.getClassName(rootTag);
        state.imports.add(rootClassName);
        state.statements.push(`${ROOT_VARIABLE} = ${rootClassName}(${this.formatArguments(example.root, rootTag)})`);
        this.appendContent({ node: example.root, tag: rootTag, variable: ROOT_VARIABLE, state });
        return {
            imports: [...state.imports].sort((a, b) => a.localeCompare(b, "en")),
            statements: state.statements,
            rootVariable: ROOT_VARIABLE
        };
    }

    private appendContent({
        node,
        tag,
        variable,
        state
    }: {
        node: FernIr.TwimlExampleNode;
        tag: FernIr.TwimlTag;
        variable: string;
        state: SnippetState;
    }): void {
        node.content.forEach((content, index) => {
            switch (content.type) {
                case "text":
                    if (!isBodyText({ tag, index })) {
                        state.statements.push(`${variable}.add_text(${pythonString(content.value)})`);
                    }
                    return;
                case "node":
                    this.appendChild({ child: content, parentVariable: variable, state });
                    return;
                default:
                    assertNever(content);
            }
        });
    }

    private appendChild({
        child,
        parentVariable,
        state
    }: {
        child: FernIr.TwimlExampleNode;
        parentVariable: string;
        state: SnippetState;
    }): void {
        const childTag = this.names.getTagOrThrow(child.tag);
        const args = this.formatArguments(child, childTag);
        if (!needsVariable(child, childTag)) {
            state.statements.push(`${parentVariable}.${this.names.getChildMethodName(childTag)}(${args})`);
            return;
        }
        const className = this.names.getClassName(childTag);
        const variable = this.allocateVariable(className, state);
        state.imports.add(className);
        state.statements.push(`${variable} = ${className}(${args})`);
        this.appendContent({ node: child, tag: childTag, variable, state });
        state.statements.push(`${parentVariable}.append(${variable})`);
    }

    /** `"Hello!", voice="woman", loop=2` — body first (if the element starts with text), then attributes. */
    private formatArguments(node: FernIr.TwimlExampleNode, tag: FernIr.TwimlTag): string {
        const args: string[] = [];
        const [first] = node.content;
        if (first?.type === "text" && isBodyText({ tag, index: 0 })) {
            args.push(pythonString(first.value));
        }
        const attributesByName = new Map(
            tag.attributes.map((attribute) => [getOriginalName(attribute.name), attribute])
        );
        for (const attribute of node.attributes) {
            const attributeName = getOriginalName(attribute.name);
            const definition = attributesByName.get(attributeName);
            if (definition == null) {
                throw new Error(`Example uses unknown attribute '${attributeName}' on <${tag.xmlName}>`);
            }
            args.push(`${this.names.getAttributeName(definition)}=${formatValue(attribute.value)}`);
        }
        return args.join(", ");
    }

    private allocateVariable(className: string, state: SnippetState): string {
        const base = this.names.getVariableName(className);
        const count = (state.variableCounts.get(base) ?? 0) + 1;
        state.variableCounts.set(base, count);
        return count === 1 ? base : `${base}_${count}`;
    }
}

interface SnippetState {
    imports: Set<string>;
    statements: string[];
    variableCounts: Map<string, number>;
}

/** Leading text of an element with a body is passed to the constructor; everything else is `add_text`. */
function isBodyText({ tag, index }: { tag: FernIr.TwimlTag; index: number }): boolean {
    return tag.body != null && index === 0;
}

/** Anything beyond constructor arguments (children or extra text) needs the element in a variable. */
function needsVariable(node: FernIr.TwimlExampleNode, tag: FernIr.TwimlTag): boolean {
    return node.content.some((content, index) => content.type === "node" || !isBodyText({ tag, index }));
}

export function formatValue(value: FernIr.TwimlExampleValue): string {
    switch (value.type) {
        case "string":
            return pythonString(value.value);
        case "integer":
            return `${value.value}`;
        case "boolean":
            return value.value ? "True" : "False";
        case "enum":
            return pythonString(typeof value.value === "string" ? value.value : value.value.wireValue);
        case "list":
            return `[${value.items.map((item) => formatValue(item)).join(", ")}]`;
        default:
            assertNever(value);
    }
}
