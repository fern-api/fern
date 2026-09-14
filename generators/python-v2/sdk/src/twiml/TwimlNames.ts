import { CaseConverter, getOriginalName } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { python } from "@fern-api/python-ast";
import { FernIr } from "@fern-fern/ir-sdk";

export const TWIML_PACKAGE = "twiml";
export const TWIML_BASE_CLASS = "TwiML";

/** Members of the runtime `TwiML` class that a generated child-builder method must not shadow. */
const RUNTIME_MEMBERS: ReadonlySet<string> = new Set([
    "name",
    "value",
    "verbs",
    "attrs",
    "to_xml",
    "xml",
    "nest",
    "append",
    "add_text",
    "add_child"
]);

/**
 * Resolves the Python identifiers used for a TwiML namespace: class names, module names,
 * fluent child-method names and keyword-argument names. Every name is recomputed from the
 * IR's original name so Python keywords are escaped regardless of which language the IR was
 * generated for.
 */
export class TwimlNames {
    private readonly tagsById: Record<FernIr.TwimlTagId, FernIr.TwimlTag>;

    constructor(
        private readonly caseConverter: CaseConverter,
        private readonly namespace: FernIr.TwimlNamespace
    ) {
        this.tagsById = namespace.tags;
    }

    public getTagOrThrow(id: FernIr.TwimlTagId): FernIr.TwimlTag {
        const tag = this.tagsById[id];
        if (tag == null) {
            throw new Error(`TwiML namespace '${getOriginalName(this.namespace.name)}' has no tag '${id}'`);
        }
        return tag;
    }

    public getRootTag(): FernIr.TwimlTag {
        return this.getTagOrThrow(this.namespace.root);
    }

    /** `voice_response` -> `voice_response.py`, matching twilio-python's module layout. */
    public getModuleName(): string {
        return this.caseConverter.snakeSafe(getOriginalName(this.getRootTag().name));
    }

    /** `ssml_break` -> `SsmlBreak` */
    public getClassName(tag: FernIr.TwimlTag): string {
        return this.caseConverter.pascalSafe(getOriginalName(tag.name));
    }

    /** `<break>` -> `say.break_(...)`, `<ConversationRelay>` -> `connect.conversation_relay(...)` */
    public getChildMethodName(tag: FernIr.TwimlTag): string {
        const name = this.caseConverter.snakeSafe(tag.xmlName);
        return RUNTIME_MEMBERS.has(name) ? `${name}_` : name;
    }

    /** `xml:lang` -> `xml_lang`, `for` -> `for_` */
    public getAttributeName(attribute: FernIr.TwimlAttribute): string {
        return this.caseConverter.snakeSafe(getOriginalName(attribute.name));
    }

    /** `SsmlEmphasis` -> `ssml_emphasis`, for snippet variables. */
    public getVariableName(className: string): string {
        return this.caseConverter.snakeSafe(className);
    }

    public getBodyName(body: FernIr.TwimlBody): string {
        return this.caseConverter.snakeSafe(getOriginalName(body.name));
    }

    /**
     * Attributes whose Python keyword differs from what the runtime derives by lowerCamel-casing
     * the keyword (e.g. `xml_lang` -> `xml:lang`, `for_` -> `for`, `interpret_as` -> `interpret-as`).
     */
    public getAttributeNameOverrides(tag: FernIr.TwimlTag): Record<string, string> {
        const overrides: Record<string, string> = {};
        for (const attribute of tag.attributes) {
            const pythonName = this.getAttributeName(attribute);
            if (lowerCamel(pythonName) !== attribute.xmlName) {
                overrides[pythonName] = attribute.xmlName;
            }
        }
        return overrides;
    }

    /** Enums and SIDs are plain `str`, matching twilio-python (only Java/C# expose enum types). */
    public getPythonType(type: FernIr.TwimlType): python.Type {
        switch (type.type) {
            case "primitive":
                return getPrimitivePythonType(type.value);
            case "sid":
            case "enum":
                return python.Type.str();
            case "list":
                return python.Type.list(this.getPythonType(type.value));
            case "union": {
                // `phone_number|string` collapses to a single `str`.
                const members = [
                    ...new Map(
                        type.members.map((member) => this.getPythonType(member)).map((t) => [t.toString(), t])
                    ).values()
                ];
                const [first] = members;
                return members.length === 1 && first != null ? first : python.Type.union(members);
            }
            default:
                assertNever(type);
        }
    }
}

function getPrimitivePythonType(primitive: FernIr.TwimlPrimitiveType): python.Type {
    switch (primitive) {
        case "STRING":
        case "URL":
        case "HTTP_METHOD":
        case "PHONE_NUMBER":
            return python.Type.str();
        case "INTEGER":
            return python.Type.int();
        case "BOOLEAN":
            return python.Type.bool();
        case "OBJECT":
            return python.Type.dict(python.Type.str(), python.Type.any());
        default:
            assertNever(primitive);
    }
}

/** Must match `lower_camel` in the generated runtime. */
export function lowerCamel(name: string): string {
    const [head = "", ...rest] = name.replace(/_+$/, "").split("_");
    return head + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}
