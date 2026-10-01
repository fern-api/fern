/**
 * A parsed XML element. Names keep their `prefix:` verbatim (no namespace processing);
 * `text` is the element's own (non-whitespace) character data.
 */
export interface XmlNode {
    name: string;
    attributes: Record<string, string>;
    text: string | undefined;
    children: XmlNode[];
}

export class XmlParseError extends Error {
    constructor(message: string) {
        super(`Failed to parse XML: ${message}`);
        this.name = "XmlParseError";
    }
}

const NAME_START = /[A-Za-z_:]/;
const NAME_CHAR = /[A-Za-z0-9_:.-]/;

/**
 * Parses an XML document into its root element, optionally checking the root's (prefix-less) name.
 *
 * The parser is deliberately minimal and strict: it understands elements, attributes, character
 * data, CDATA sections, comments and processing instructions, and it rejects DOCTYPE declarations
 * so entity expansion attacks cannot reach it. A pre-parsed node is returned as-is.
 */
export function parseXml(xml: string | XmlNode, name?: string): XmlNode {
    const node = typeof xml === "string" ? new Parser(xml).parseDocument() : xml;
    if (name != null && localName(node.name) !== name) {
        throw new XmlParseError(`expected <${name}> element but found <${node.name}>`);
    }
    return node;
}

export function localName(name: string): string {
    const colon = name.indexOf(":");
    return colon === -1 ? name : name.substring(colon + 1);
}

class Parser {
    private position = 0;

    constructor(private readonly source: string) {}

    public parseDocument(): XmlNode {
        this.skipProlog();
        if (this.source.charAt(this.position) !== "<") {
            throw new XmlParseError("document has no root element");
        }
        const root = this.parseElement();
        this.skipMisc();
        if (this.position < this.source.length) {
            throw new XmlParseError("unexpected content after the root element");
        }
        return root;
    }

    private skipProlog(): void {
        if (this.source.charCodeAt(0) === 0xfeff) {
            this.position = 1;
        }
        this.skipMisc();
        if (this.source.startsWith("<!DOCTYPE", this.position) || this.source.startsWith("<!doctype", this.position)) {
            throw new XmlParseError("DOCTYPE declarations are not allowed");
        }
    }

    private skipMisc(): void {
        for (;;) {
            this.skipWhitespace();
            if (this.source.startsWith("<?", this.position)) {
                this.skipPast("?>", "unterminated processing instruction");
            } else if (this.source.startsWith("<!--", this.position)) {
                this.skipPast("-->", "unterminated comment");
            } else {
                return;
            }
        }
    }

    private parseElement(): XmlNode {
        this.position++; // "<"
        const name = this.parseName();
        const attributes: Record<string, string> = {};
        for (;;) {
            this.skipWhitespace();
            const char = this.source.charAt(this.position);
            if (char === "/") {
                this.expect("/>");
                return { name, attributes, text: undefined, children: [] };
            }
            if (char === ">") {
                this.position++;
                break;
            }
            const attributeName = this.parseName();
            this.skipWhitespace();
            this.expect("=");
            this.skipWhitespace();
            if (attributeName in attributes) {
                throw new XmlParseError(`duplicate attribute "${attributeName}" on <${name}>`);
            }
            attributes[attributeName] = this.parseAttributeValue();
        }

        const children: XmlNode[] = [];
        const text: string[] = [];
        for (;;) {
            if (this.position >= this.source.length) {
                throw new XmlParseError(`unclosed <${name}> element`);
            }
            if (this.source.startsWith("</", this.position)) {
                this.position += 2;
                const closingName = this.parseName();
                if (closingName !== name) {
                    throw new XmlParseError(`expected </${name}> but found </${closingName}>`);
                }
                this.skipWhitespace();
                this.expect(">");
                break;
            }
            if (this.source.startsWith("<![CDATA[", this.position)) {
                const end = this.indexOfOrThrow("]]>", this.position + 9, "unterminated CDATA section");
                text.push(this.source.substring(this.position + 9, end));
                this.position = end + 3;
            } else if (this.source.startsWith("<!--", this.position)) {
                this.skipPast("-->", "unterminated comment");
            } else if (this.source.startsWith("<?", this.position)) {
                this.skipPast("?>", "unterminated processing instruction");
            } else if (this.source.startsWith("<!", this.position)) {
                throw new XmlParseError("DOCTYPE declarations are not allowed");
            } else if (this.source.charAt(this.position) === "<") {
                children.push(this.parseElement());
            } else {
                const end = this.source.indexOf("<", this.position);
                const raw = this.source.substring(this.position, end === -1 ? this.source.length : end);
                text.push(decodeEntities(raw));
                this.position += raw.length;
            }
        }
        const joined = text.join("");
        return { name, attributes, text: joined.trim().length === 0 ? undefined : joined, children };
    }

    private parseName(): string {
        const start = this.position;
        if (!NAME_START.test(this.source.charAt(this.position))) {
            throw new XmlParseError(`expected a name at position ${this.position}`);
        }
        while (this.position < this.source.length && NAME_CHAR.test(this.source.charAt(this.position))) {
            this.position++;
        }
        return this.source.substring(start, this.position);
    }

    private parseAttributeValue(): string {
        const quote = this.source.charAt(this.position);
        if (quote !== '"' && quote !== "'") {
            throw new XmlParseError(`attribute value must be quoted at position ${this.position}`);
        }
        const end = this.indexOfOrThrow(quote, this.position + 1, "unterminated attribute value");
        const raw = this.source.substring(this.position + 1, end);
        if (raw.includes("<")) {
            throw new XmlParseError('"<" is not allowed in attribute values');
        }
        this.position = end + 1;
        return decodeEntities(raw);
    }

    private skipWhitespace(): void {
        while (this.position < this.source.length && /\s/.test(this.source.charAt(this.position))) {
            this.position++;
        }
    }

    private skipPast(terminator: string, error: string): void {
        this.position = this.indexOfOrThrow(terminator, this.position, error) + terminator.length;
    }

    private indexOfOrThrow(search: string, from: number, error: string): number {
        const index = this.source.indexOf(search, from);
        if (index === -1) {
            throw new XmlParseError(error);
        }
        return index;
    }

    private expect(token: string): void {
        if (!this.source.startsWith(token, this.position)) {
            throw new XmlParseError(`expected "${token}" at position ${this.position}`);
        }
        this.position += token.length;
    }
}

const NAMED_ENTITIES: Record<string, string> = {
    lt: "<",
    gt: ">",
    amp: "&",
    quot: '"',
    apos: "'",
};

function decodeEntities(raw: string): string {
    if (!raw.includes("&")) {
        return raw;
    }
    const segments = raw.split("&");
    let decoded = segments[0] ?? "";
    for (const segment of segments.slice(1)) {
        const end = segment.indexOf(";");
        if (end === -1) {
            throw new XmlParseError(`unescaped "&" in "${raw}"`);
        }
        decoded += decodeEntity(segment.substring(0, end)) + segment.substring(end + 1);
    }
    return decoded;
}

function decodeEntity(entity: string): string {
    const named = NAMED_ENTITIES[entity];
    if (named != null) {
        return named;
    }
    const hex = /^#x([0-9A-Fa-f]+)$/.exec(entity);
    const decimal = /^#([0-9]+)$/.exec(entity);
    const codePoint =
        hex?.[1] != null ? parseInt(hex[1], 16) : decimal?.[1] != null ? parseInt(decimal[1], 10) : undefined;
    if (codePoint == null) {
        throw new XmlParseError(`unknown entity &${entity};`);
    }
    try {
        return String.fromCodePoint(codePoint);
    } catch {
        throw new XmlParseError(`invalid character reference &${entity};`);
    }
}
