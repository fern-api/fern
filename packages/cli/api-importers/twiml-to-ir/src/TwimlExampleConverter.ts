import { assertNever, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/ir-sdk";
import { AbstractConverter, APIErrorLevel } from "@fern-api/v3-importer-commons";
import { type ChildNode, type Element, isTag, isText } from "domhandler";
import { parseDocument } from "htmlparser2";
import { TwimlExampleSource } from "./loadTwimlDocument.js";
import { TwimlConverterContext } from "./TwimlConverterContext.js";

export declare namespace TwimlExampleConverter {
    interface Args extends AbstractConverter.Args<TwimlConverterContext> {
        example: TwimlExampleSource;
        namespaces: FernIr.TwimlNamespace[];
    }
}

const LIST_SEPARATOR = /\s+/;
const INTEGER_PATTERN = /^[+-]?\d+$/;

type ValueResult = { ok: true; value: FernIr.TwimlExampleValue } | { ok: false; reason: string };

/**
 * Parses an XML example document and resolves every element against the tag graph, so
 * generators can render it as a builder snippet without re-implementing validation.
 */
export class TwimlExampleConverter extends AbstractConverter<TwimlConverterContext, FernIr.TwimlExample> {
    private readonly example: TwimlExampleSource;
    private readonly namespaces: FernIr.TwimlNamespace[];

    constructor({ context, breadcrumbs, example, namespaces }: TwimlExampleConverter.Args) {
        super({ context, breadcrumbs });
        this.example = example;
        this.namespaces = namespaces;
    }

    public convert(): FernIr.TwimlExample | undefined {
        const rootElement = this.parseRootElement();
        if (rootElement == null) {
            return undefined;
        }
        const namespace = this.resolveNamespace(rootElement);
        if (namespace == null) {
            return undefined;
        }
        const rootTag = namespace.tags[namespace.root];
        if (rootTag == null) {
            return undefined;
        }
        const root = this.convertElement({ element: rootElement, tag: rootTag, namespace, path: [rootElement.name] });
        if (root == null) {
            return undefined;
        }
        return {
            id: this.example.id,
            name: this.context.casingsGenerator.generateName(this.example.id),
            docs: undefined,
            xml: this.example.xml,
            root
        };
    }

    /**
     * htmlparser2 recovers from malformed XML (unclosed or mismatched tags) instead of failing, so
     * structural mistakes surface as tag-graph validation errors below rather than parse errors.
     */
    private parseRootElement(): Element | undefined {
        const document = parseDocument(this.example.xml, { xmlMode: true });
        const elements = document.children.filter(isTag);
        const [root] = elements;
        if (root == null || elements.length !== 1) {
            this.collectError(`expected exactly one root element, found ${elements.length}`);
            return undefined;
        }
        return root;
    }

    /**
     * Examples nested under `<namespace>/` are bound to that namespace; top-level ones are matched by
     * their root element, which is unambiguous as long as roots differ or only one namespace validates.
     */
    private resolveNamespace(root: Element): FernIr.TwimlNamespace | undefined {
        const candidates = this.namespaces.filter((namespace) => {
            const rootTag = namespace.tags[namespace.root];
            return rootTag != null && rootTag.xmlName === root.name;
        });
        if (this.example.namespace != null) {
            const match = candidates.find((namespace) => nameToString(namespace.name) === this.example.namespace);
            if (match == null) {
                this.collectError(
                    `root element <${root.name}> does not match the root of namespace '${this.example.namespace}'`
                );
            }
            return match;
        }
        if (candidates.length <= 1) {
            if (candidates.length === 0) {
                this.collectError(`root element <${root.name}> is not the root of any TwiML namespace`);
            }
            return candidates[0];
        }
        const valid = candidates.filter((namespace) => this.isValidIn({ element: root, namespace }));
        const [single] = valid;
        if (single != null && valid.length === 1) {
            return single;
        }
        const listNamespaces = (namespaces: FernIr.TwimlNamespace[]): string =>
            namespaces.map((namespace) => `'${nameToString(namespace.name)}'`).join(", ");
        this.collectError(
            valid.length === 0
                ? `root element <${root.name}> matches namespaces ${listNamespaces(candidates)} but the document is not valid in any of them`
                : `root element <${root.name}> is valid in namespaces ${listNamespaces(valid)}; place the example under a <namespace>/ directory to disambiguate`
        );
        return undefined;
    }

    private isValidIn({ element, namespace }: { element: Element; namespace: FernIr.TwimlNamespace }): boolean {
        const walk = (node: Element, tag: FernIr.TwimlTag): boolean =>
            node.children.filter(isTag).every((child) => {
                const childTag = this.findChildTag({ tag, namespace, xmlName: child.name });
                return childTag != null && walk(child, childTag);
            });
        const rootTag = namespace.tags[namespace.root];
        return rootTag != null && walk(element, rootTag);
    }

    private findChildTag({
        tag,
        namespace,
        xmlName
    }: {
        tag: FernIr.TwimlTag;
        namespace: FernIr.TwimlNamespace;
        xmlName: string;
    }): FernIr.TwimlTag | undefined {
        for (const childId of tag.children) {
            const child = namespace.tags[childId];
            if (child?.xmlName === xmlName) {
                return child;
            }
        }
        return undefined;
    }

    private convertElement({
        element,
        tag,
        namespace,
        path
    }: {
        element: Element;
        tag: FernIr.TwimlTag;
        namespace: FernIr.TwimlNamespace;
        path: string[];
    }): FernIr.TwimlExampleNode | undefined {
        let valid = true;
        const attributes: FernIr.TwimlExampleAttribute[] = [];
        for (const [xmlName, rawValue] of Object.entries(element.attribs)) {
            const attribute = tag.attributes.find((candidate) => candidate.xmlName === xmlName);
            if (attribute == null) {
                this.collectError(`<${element.name}> does not accept attribute '${xmlName}'`, path);
                valid = false;
                continue;
            }
            const result = convertValue({ type: attribute.type, tag, rawValue });
            if (!result.ok) {
                this.collectError(`attribute '${xmlName}': ${result.reason}`, [...path, `@${xmlName}`]);
                valid = false;
                continue;
            }
            attributes.push({ name: attribute.name, value: result.value });
        }

        const content: FernIr.TwimlExampleContent[] = [];
        for (const child of element.children) {
            const converted = this.convertChild({ child, tag, namespace, path });
            if (converted.type === "skip") {
                continue;
            }
            if (converted.type === "invalid") {
                valid = false;
                continue;
            }
            content.push(converted.content);
        }
        const hasText = content.some((entry) => entry.type === "text");
        if (tag.body == null && hasText) {
            this.collectError(`<${element.name}> does not accept text content`, path);
            valid = false;
        }
        if (tag.body?.required === true && !hasText) {
            this.collectError(`<${element.name}> requires text content`, path);
            valid = false;
        }
        return valid ? { tag: tag.id, attributes, content } : undefined;
    }

    private convertChild({
        child,
        tag,
        namespace,
        path
    }: {
        child: ChildNode;
        tag: FernIr.TwimlTag;
        namespace: FernIr.TwimlNamespace;
        path: string[];
    }): { type: "content"; content: FernIr.TwimlExampleContent } | { type: "skip" } | { type: "invalid" } {
        if (isText(child)) {
            return child.data.trim().length === 0
                ? { type: "skip" }
                : { type: "content", content: FernIr.TwimlExampleContent.text(child.data) };
        }
        if (!isTag(child)) {
            return { type: "skip" };
        }
        const childTag = this.findChildTag({ tag, namespace, xmlName: child.name });
        if (childTag == null) {
            this.collectError(`<${child.name}> is not allowed inside <${tag.xmlName}>`, [...path, child.name]);
            return { type: "invalid" };
        }
        const node = this.convertElement({ element: child, tag: childTag, namespace, path: [...path, child.name] });
        return node != null ? { type: "content", content: FernIr.TwimlExampleContent.node(node) } : { type: "invalid" };
    }

    private collectError(message: string, path: string[] = []): void {
        this.context.errorCollector.collect({
            level: APIErrorLevel.ERROR,
            message: `Invalid TwiML example ${this.example.relativeFilepath}: ${message}`,
            path: [...this.breadcrumbs, ...path]
        });
    }
}

function nameToString(name: FernIr.NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}

function wireValueOf(value: FernIr.NameAndWireValueOrString): string {
    return typeof value === "string" ? value : value.wireValue;
}

function convertValue({
    type,
    tag,
    rawValue
}: {
    type: FernIr.TwimlType;
    tag: FernIr.TwimlTag;
    rawValue: string;
}): ValueResult {
    return visitDiscriminatedUnion(type)._visit<ValueResult>({
        primitive: ({ value }) => convertPrimitiveValue({ primitive: value, rawValue }),
        sid: () => ({ ok: true, value: FernIr.TwimlExampleValue.string(rawValue) }),
        enum: ({ value: enumName }) => {
            const match = tag.enums[enumName]?.values.find((value) => wireValueOf(value) === rawValue);
            return match != null
                ? { ok: true, value: FernIr.TwimlExampleValue.enum(match) }
                : { ok: false, reason: `'${rawValue}' is not a value of enum '${enumName}'` };
        },
        list: ({ value: itemType }) => {
            const items: FernIr.TwimlExampleValue[] = [];
            for (const item of rawValue.split(LIST_SEPARATOR).filter((part) => part.length > 0)) {
                const result = convertValue({ type: itemType, tag, rawValue: item });
                if (!result.ok) {
                    return result;
                }
                items.push(result.value);
            }
            return { ok: true, value: FernIr.TwimlExampleValue.list({ items }) };
        },
        union: ({ members }) => {
            const reasons: string[] = [];
            for (const member of members) {
                const result = convertValue({ type: member, tag, rawValue });
                if (result.ok) {
                    return result;
                }
                reasons.push(result.reason);
            }
            return { ok: false, reason: reasons.join("; ") };
        }
    });
}

function convertPrimitiveValue({
    primitive,
    rawValue
}: {
    primitive: FernIr.TwimlPrimitiveType;
    rawValue: string;
}): ValueResult {
    switch (primitive) {
        case FernIr.TwimlPrimitiveType.Integer: {
            const parsed = INTEGER_PATTERN.test(rawValue.trim()) ? Number(rawValue) : Number.NaN;
            return Number.isInteger(parsed)
                ? { ok: true, value: FernIr.TwimlExampleValue.integer(parsed) }
                : { ok: false, reason: `'${rawValue}' is not an integer` };
        }
        case FernIr.TwimlPrimitiveType.Boolean:
            return rawValue === "true" || rawValue === "false"
                ? { ok: true, value: FernIr.TwimlExampleValue.boolean(rawValue === "true") }
                : { ok: false, reason: `'${rawValue}' is not a boolean` };
        case FernIr.TwimlPrimitiveType.String:
        case FernIr.TwimlPrimitiveType.Url:
        case FernIr.TwimlPrimitiveType.HttpMethod:
        case FernIr.TwimlPrimitiveType.PhoneNumber:
        case FernIr.TwimlPrimitiveType.Object:
            return { ok: true, value: FernIr.TwimlExampleValue.string(rawValue) };
        default:
            assertNever(primitive);
    }
}
