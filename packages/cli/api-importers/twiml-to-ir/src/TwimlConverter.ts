import { FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { AbstractSpecConverter, APIErrorLevel } from "@fern-api/v3-importer-commons";
import { TwimlExampleSource, TwimlNamespaceSource, TwimlTagSource } from "./loadTwimlDocument.js";
import { parseTwimlType } from "./parseTwimlType.js";
import { RawTwimlAttribute, RawTwimlBody, TwimlVisibility } from "./schemas.js";
import { TwimlConverterContext } from "./TwimlConverterContext.js";
import { TwimlExampleConverter } from "./TwimlExampleConverter.js";

export declare namespace TwimlConverter {
    type Args = AbstractSpecConverter.Args<TwimlConverterContext>;
}

/**
 * Converts a loaded TwiML document into an IR whose `twiml` section describes the builder
 * library. The HTTP surface of the resulting IR is empty; `OSSWorkspace` merges it with the
 * IR produced from the API's other specs.
 */
export class TwimlConverter extends AbstractSpecConverter<TwimlConverterContext, IntermediateRepresentation> {
    constructor({ context, breadcrumbs, audiences }: TwimlConverter.Args) {
        super({ context, breadcrumbs, audiences });
    }

    public convert(): IntermediateRepresentation {
        this.ir.twiml = this.convertTwimlDefinition();
        return this.finalizeIr();
    }

    public convertTwimlDefinition(): FernIr.TwimlDefinition {
        const namespaces = Object.values(this.context.spec.namespaces)
            .sort((a, b) => a.name.localeCompare(b.name, "en"))
            .map((namespace) => this.convertNamespace(namespace));
        const examples = this.context.spec.examples
            .map((example) => this.convertExample({ example, namespaces }))
            .filter((example): example is FernIr.TwimlExample => example != null);
        return { namespaces, examples };
    }

    private convertNamespace(namespace: TwimlNamespaceSource): FernIr.TwimlNamespace {
        const tags: Record<FernIr.TwimlTagId, FernIr.TwimlTag> = {};
        for (const source of Object.values(namespace.tags)) {
            tags[source.id] = this.convertTag({ source, namespace });
        }
        return {
            name: this.context.casingsGenerator.generateName(namespace.name),
            docs: undefined,
            root: namespace.root.id,
            tags
        };
    }

    private convertTag({
        source,
        namespace
    }: {
        source: TwimlTagSource;
        namespace: TwimlNamespaceSource;
    }): FernIr.TwimlTag {
        const { tag, id, relativeFilepath } = source;
        const enumNames = new Set(Object.keys(tag.enums ?? {}));
        const bodies = Object.entries(tag.body ?? {});
        if (bodies.length > 1) {
            this.collectError(`tag '${id}' declares ${bodies.length} bodies; an XML element has a single text body`, [
                relativeFilepath,
                "body"
            ]);
        }
        const [firstBody] = bodies;
        return {
            id,
            name: this.context.casingsGenerator.generateName(tag.class_name),
            xmlName: toXmlTagName({ tagName: tag.tag_name, casing: tag.tag_casing }),
            docs: toDocs(tag.docstring),
            body:
                firstBody != null
                    ? this.convertBody({ name: firstBody[0], body: firstBody[1], enumNames, id, relativeFilepath })
                    : undefined,
            attributes: Object.entries(tag.attributes ?? {}).map(([key, attribute]) =>
                this.convertAttribute({ key, attribute, enumNames, id, relativeFilepath })
            ),
            enums: Object.fromEntries(
                Object.entries(tag.enums ?? {}).map(([name, values]) => [name, this.convertEnum({ name, values })])
            ),
            children: (tag.children ?? []).filter((child) => {
                if (namespace.tags[child] != null) {
                    return true;
                }
                this.collectError(
                    `tag '${id}' references child '${child}', which is not defined in namespace '${namespace.name}'`,
                    [relativeFilepath, "children"]
                );
                return false;
            }),
            visibility: FernIr.TwimlVisibility.Public
        };
    }

    private convertBody({
        name,
        body,
        enumNames,
        id,
        relativeFilepath
    }: {
        name: string;
        body: RawTwimlBody;
        enumNames: ReadonlySet<string>;
        id: string;
        relativeFilepath: string;
    }): FernIr.TwimlBody {
        return {
            name: this.context.casingsGenerator.generateName(toNeutralName(name)),
            docs: toDocs(body.docstring),
            type: this.convertType({ type: body.type, enumNames, path: [relativeFilepath, "body", name], id }),
            required: body.required ?? false
        };
    }

    private convertAttribute({
        key,
        attribute,
        enumNames,
        id,
        relativeFilepath
    }: {
        key: string;
        attribute: RawTwimlAttribute;
        enumNames: ReadonlySet<string>;
        id: string;
        relativeFilepath: string;
    }): FernIr.TwimlAttribute {
        return {
            name: this.context.casingsGenerator.generateName(toNeutralName(key)),
            xmlName: toXmlAttributeName(key),
            docs: toDocs(attribute.docstring),
            type: this.convertType({
                type: attribute.type,
                enumNames,
                path: [relativeFilepath, "attributes", key],
                id
            }),
            visibility: toVisibility(attribute.library_visibility)
        };
    }

    private convertEnum({ name, values }: { name: string; values: string[] }): FernIr.TwimlEnum {
        return {
            name: this.context.casingsGenerator.generateName(toNeutralName(name)),
            values: values.map((value) =>
                this.context.casingsGenerator.generateNameAndWireValue({
                    name: toNeutralName(value),
                    wireValue: value
                })
            )
        };
    }

    private convertType({
        type,
        enumNames,
        path,
        id
    }: {
        type: string;
        enumNames: ReadonlySet<string>;
        path: string[];
        id: string;
    }): FernIr.TwimlType {
        const parsed = parseTwimlType({ type, enums: enumNames });
        if (parsed.ok) {
            return parsed.type;
        }
        this.collectError(`tag '${id}' has invalid type '${type}': ${parsed.reason}`, path);
        return FernIr.TwimlType.primitive(FernIr.TwimlPrimitiveType.String);
    }

    private convertExample({
        example,
        namespaces
    }: {
        example: TwimlExampleSource;
        namespaces: FernIr.TwimlNamespace[];
    }): FernIr.TwimlExample | undefined {
        return new TwimlExampleConverter({
            context: this.context,
            breadcrumbs: [example.relativeFilepath],
            example,
            namespaces
        }).convert();
    }

    private collectError(message: string, path: string[]): void {
        this.context.errorCollector.collect({ level: APIErrorLevel.ERROR, message, path });
    }
}

function toDocs(docstring: string | undefined): string | undefined {
    return docstring != null && docstring.length > 0 ? docstring : undefined;
}

function toVisibility(visibility: TwimlVisibility | undefined): FernIr.TwimlVisibility {
    switch (visibility) {
        case undefined:
        case "public":
            return FernIr.TwimlVisibility.Public;
        case "internal":
            return FernIr.TwimlVisibility.Internal;
    }
}

/** `say` -> `Say`, `conversation_relay` -> `ConversationRelay`; SSML tags opt out with `tag_casing: none`. */
export function toXmlTagName({
    tagName,
    casing
}: {
    tagName: string;
    casing: "upper_camel" | "none" | undefined;
}): string {
    if (casing === "none") {
        return tagName;
    }
    return tagName
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
}

/**
 * Attribute keys are written in the definitions as snake_case (`caller_id` -> `callerId`), or already in
 * wire form when they contain no underscore (`xml:lang`, `interpret-as`, `speechTimeout`).
 */
export function toXmlAttributeName(key: string): string {
    if (!key.includes("_")) {
        return key;
    }
    const [head, ...rest] = key.split("_");
    return (head ?? "") + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}

/** Turns a definition key into an identifier the casings generator can work with (`xml:lang` -> `xml_lang`, `for_` -> `for`). */
export function toNeutralName(key: string): string {
    return key.replace(/[^A-Za-z0-9_]/g, "_").replace(/_+$/, "");
}
