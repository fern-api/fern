import { AbstractAstNode } from "@fern-api/browser-compatible-base-generator";
import { type ChildNode, type Element, isTag, isText } from "domhandler";
import { parseDocument } from "htmlparser2";
import { XmlDocBlock } from "../language/XmlDocBlock.js";
import { AstNode } from "./AstNode.js";
import { Writer } from "./Writer.js";

export class XmlDocWriter {
    // Tags that are safe to preserve in XML documentation comments
    // Reference: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/xmldoc/recommended-tags
    private static readonly SAFE_XML_DOC_TAGS = new Set([
        // C# XML doc standard tags (officially documented)
        "c",
        "code",
        "description",
        "example",
        "exception",
        "include",
        "inheritdoc",
        "item",
        "list",
        "listheader",
        "para",
        "param",
        "paramref",
        "permission",
        "remarks",
        "returns",
        "see",
        "seealso",
        "summary",
        "term",
        "typeparam",
        "typeparamref",
        "value",
        // HTML formatting tags explicitly mentioned in Microsoft docs
        "a",
        "b",
        "br",
        "i",
        "u",
        "p"
    ]);

    // HTML tags that the converter knows how to transform to XMLDoc equivalents
    private static readonly CONVERTIBLE_HTML_TAGS = new Set([
        "code",
        "pre",
        "p",
        "ul",
        "ol",
        "li",
        "a",
        "br",
        "b",
        "strong",
        "i",
        "em",
        "tt",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "div",
        "span",
        "table",
        "tr",
        "td",
        "th",
        "thead",
        "tbody"
    ]);

    private writer: Writer;
    private wrotePrefixOnCurrentLine: boolean = false;
    constructor(writer: Writer) {
        this.writer = writer;
    }

    public write(text: string | XmlDocBlock): void {
        if (typeof text === "string") {
            this.writer.write(text);
            return;
        }
        text.write(this.writer);
    }

    public writeWithEscaping(text: string | XmlDocBlock): void {
        if (typeof text === "string") {
            this.writer.write(this.escapeXmlDocContent(text));
            return;
        }
        text.write(this.writer);
    }

    public writeLine(text = ""): void {
        this.writePrefix();
        this.writer.writeLine(text);
        this.wrotePrefixOnCurrentLine = false;
    }

    public writeLineWithEscaping(text: string): void {
        this.writePrefix();
        this.writer.write(this.escapeXmlDocContent(text));
        this.wrotePrefixOnCurrentLine = false;
    }

    public writeNewLineIfLastLineNot(): void {
        this.writer.writeNewLineIfLastLineNot();
        this.wrotePrefixOnCurrentLine = false;
    }

    public writeNodeOrString(input: AbstractAstNode | string): void {
        this.writer.write(input);
    }

    public writePrefix(): this {
        if (this.wrotePrefixOnCurrentLine) {
            return this;
        }
        this.writer.write("/// ");
        this.wrotePrefixOnCurrentLine = true;
        return this;
    }

    public writeOpenXmlNode(nodeName: string): void {
        this.write(`<${nodeName}>`);
    }

    public writeCloseXmlNode(nodeName: string): void {
        this.write(`</${nodeName}>`);
    }

    public writeNode(node: AstNode): void {
        this.writer.writeNode(node);
    }

    public writeXmlNode(nodeName: string, text: string): void {
        this.writePrefix();
        this.writeOpenXmlNode(nodeName);
        this.writeLine(text);
        this.writePrefix();
        this.writeCloseXmlNode(nodeName);
    }

    public writeXmlNodeMultiline(nodeName: string, text: string): void {
        this.writePrefix();
        this.writeOpenXmlNode(nodeName);
        this.writeLine();
        this.writeMultiline(text);
        this.writeLine();
        this.writePrefix();
        this.writeCloseXmlNode(nodeName);
    }

    public writeXmlNodeWithEscaping(nodeName: string, text: string): void {
        this.writeOpenXmlNode(nodeName);
        this.writeLineWithEscaping(text);
        this.writeCloseXmlNode(nodeName);
    }

    public writeMultilineNodeWithEscaping(nodeName: string, text: string): void {
        this.writeOpenXmlNode(nodeName);
        this.writeLine();
        this.writeMultilineWithEscaping(text);
        this.writeLine();
        this.writeCloseXmlNode(nodeName);
    }

    public writeMultiline(text: string): void {
        text.trim()
            .split("\n")
            .forEach((line) => {
                this.writeLine(line);
            });
    }

    public writeMultilineWithEscaping(text: string): void {
        text = this.escapeXmlDocContent(text);
        this.writeMultiline(text);
    }

    private escapeXmlDocContent(text: string): string {
        const decoded = this.decodeHtmlEntities(text);
        const converted = this.convertHtmlToXmlDoc(decoded);

        // XML/HTML tag regex
        const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
        const tags: string[] = [];

        // Replace safe tags with placeholders to protect them from escaping
        const withPlaceholders = converted.replace(tagPattern, (match, tagName: string) => {
            if (XmlDocWriter.SAFE_XML_DOC_TAGS.has(tagName.toLowerCase())) {
                const index = tags.push(match) - 1;
                return `\uE000${index}\uE000`;
            }
            return match;
        });
        const escaped = withPlaceholders.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

        return escaped.replace(/\uE000(\d+)\uE000/g, (_, index: string) => tags[parseInt(index, 10)] ?? "");
    }

    private convertHtmlToXmlDoc(text: string): string {
        // Quick check: if no HTML-like tags, return as-is
        if (!/<[a-zA-Z]/.test(text)) {
            return text;
        }

        // Pre-escape complete tags that are neither convertible HTML nor safe XMLDoc
        text = text.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g, (match, tagName: string) => {
            const lower = tagName.toLowerCase();
            if (XmlDocWriter.CONVERTIBLE_HTML_TAGS.has(lower) || XmlDocWriter.SAFE_XML_DOC_TAGS.has(lower)) {
                return match;
            }
            return match.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        });

        // Pre-escape incomplete tags (no closing >) to prevent htmlparser2 from consuming them
        text = text.replace(/<(?=[a-zA-Z])(?![^>]*>)/g, "&lt;");

        const doc = parseDocument(text, {
            decodeEntities: false,
            recognizeSelfClosing: true,
            lowerCaseAttributeNames: true
        });
        return this.renderNodes(doc.children);
    }

    private renderNodes(nodes: readonly ChildNode[]): string {
        return nodes.map((node) => this.renderNode(node)).join("");
    }

    private renderNode(node: ChildNode): string {
        if (isText(node)) {
            return node.data;
        }
        if (isTag(node)) {
            return this.renderElement(node);
        }
        // Comments, directives, etc. - strip
        return "";
    }

    private renderElement(el: Element): string {
        const tag = el.name.toLowerCase();
        const children = this.renderNodes(el.children);

        switch (tag) {
            case "code":
            case "tt": {
                // Inside <pre>, keep as <code> (block code); otherwise use <c> (inline)
                // <tt> is deprecated HTML; MS docs recommend <c> instead
                const parentTag = el.parent != null && isTag(el.parent) ? el.parent.name.toLowerCase() : undefined;
                if (parentTag === "pre") {
                    return `<code>${children}</code>`;
                }
                return `<c>${children}</c>`;
            }
            case "pre": {
                // If the only meaningful child is <code>, let it render (it outputs <code>)
                const meaningfulChildren = el.children.filter((c) => !isText(c) || c.data.trim() !== "");
                if (
                    meaningfulChildren.length === 1 &&
                    meaningfulChildren[0] != null &&
                    isTag(meaningfulChildren[0]) &&
                    meaningfulChildren[0].name.toLowerCase() === "code"
                ) {
                    return children;
                }
                return `<code>${children}</code>`;
            }
            case "p":
                return `<para>${children}</para>`;
            case "ul":
                return `<list type="bullet">${children}</list>`;
            case "ol":
                return `<list type="number">${children}</list>`;
            case "li":
                return `<item><description>${children}</description></item>`;
            case "a": {
                const href = el.attribs.href;
                if (href) {
                    return `<see href="${href}">${children}</see>`;
                }
                return children;
            }
            case "br":
                return "<br/>";
            case "b":
            case "strong":
                return `<b>${children}</b>`;
            case "i":
            case "em":
                return `<i>${children}</i>`;
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
                return `<para>${children}</para>`;
            case "div":
            case "span":
            case "table":
            case "tr":
            case "td":
            case "th":
            case "thead":
            case "tbody":
                // Strip these tags, keep content
                return children;
            default: {
                // Known XMLDoc tags: pass through with attributes
                if (XmlDocWriter.SAFE_XML_DOC_TAGS.has(tag)) {
                    const attrs = Object.entries(el.attribs)
                        .map(([k, v]) => ` ${k}="${v}"`)
                        .join("");
                    if (el.children.length === 0) {
                        return `<${el.name}${attrs}/>`;
                    }
                    return `<${el.name}${attrs}>${children}</${el.name}>`;
                }
                // Unknown tags: strip tag, keep content
                return children;
            }
        }
    }

    private decodeHtmlEntities(text: string): string {
        const entityMap: Record<string, string> = {
            "&plus;": "+",
            "&minus;": "-",
            "&times;": "×",
            "&divide;": "÷",
            "&nbsp;": " ",
            "&hellip;": "…",
            "&middot;": "·",
            "&copy;": "©",
            "&reg;": "®",
            "&trade;": "™",
            "&deg;": "°",
            "&plusmn;": "±",
            "&frac14;": "¼",
            "&frac12;": "½",
            "&frac34;": "¾",
            "&ndash;": "–",
            "&mdash;": "—",
            "&lsquo;": "\u2018",
            "&rsquo;": "\u2019",
            "&ldquo;": "\u201C",
            "&rdquo;": "\u201D",
            "&bull;": "•",
            "&euro;": "€",
            "&pound;": "£",
            "&yen;": "¥",
            "&cent;": "¢",
            "&sect;": "§",
            "&para;": "¶",
            "&dagger;": "†",
            "&Dagger;": "‡",
            "&permil;": "‰",
            "&lsaquo;": "‹",
            "&rsaquo;": "›",
            "&spades;": "♠",
            "&clubs;": "♣",
            "&hearts;": "♥",
            "&diams;": "♦",
            "&larr;": "←",
            "&uarr;": "↑",
            "&rarr;": "→",
            "&darr;": "↓",
            "&harr;": "↔",
            "&crarr;": "↵",
            "&lArr;": "⇐",
            "&uArr;": "⇑",
            "&rArr;": "⇒",
            "&dArr;": "⇓",
            "&hArr;": "⇔",
            "&forall;": "∀",
            "&part;": "∂",
            "&exist;": "∃",
            "&empty;": "∅",
            "&nabla;": "∇",
            "&isin;": "∈",
            "&notin;": "∉",
            "&ni;": "∋",
            "&prod;": "∏",
            "&sum;": "∑",
            "&lowast;": "∗",
            "&radic;": "√",
            "&prop;": "∝",
            "&infin;": "∞",
            "&ang;": "∠",
            "&and;": "∧",
            "&or;": "∨",
            "&cap;": "∩",
            "&cup;": "∪",
            "&int;": "∫",
            "&there4;": "∴",
            "&sim;": "∼",
            "&cong;": "≅",
            "&asymp;": "≈",
            "&ne;": "≠",
            "&equiv;": "≡",
            "&le;": "≤",
            "&ge;": "≥",
            "&sub;": "⊂",
            "&sup;": "⊃",
            "&nsub;": "⊄",
            "&sube;": "⊆",
            "&supe;": "⊇",
            "&oplus;": "⊕",
            "&otimes;": "⊗",
            "&perp;": "⊥",
            "&sdot;": "⋅",
            "&Alpha;": "Α",
            "&Beta;": "Β",
            "&Gamma;": "Γ",
            "&Delta;": "Δ",
            "&Epsilon;": "Ε",
            "&Zeta;": "Ζ",
            "&Eta;": "Η",
            "&Theta;": "Θ",
            "&Iota;": "Ι",
            "&Kappa;": "Κ",
            "&Lambda;": "Λ",
            "&Mu;": "Μ",
            "&Nu;": "Ν",
            "&Xi;": "Ξ",
            "&Omicron;": "Ο",
            "&Pi;": "Π",
            "&Rho;": "Ρ",
            "&Sigma;": "Σ",
            "&Tau;": "Τ",
            "&Upsilon;": "Υ",
            "&Phi;": "Φ",
            "&Chi;": "Χ",
            "&Psi;": "Ψ",
            "&Omega;": "Ω",
            "&alpha;": "α",
            "&beta;": "β",
            "&gamma;": "γ",
            "&delta;": "δ",
            "&epsilon;": "ε",
            "&zeta;": "ζ",
            "&eta;": "η",
            "&theta;": "θ",
            "&iota;": "ι",
            "&kappa;": "κ",
            "&lambda;": "λ",
            "&mu;": "μ",
            "&nu;": "ν",
            "&xi;": "ξ",
            "&omicron;": "ο",
            "&pi;": "π",
            "&rho;": "ρ",
            "&sigmaf;": "ς",
            "&sigma;": "σ",
            "&tau;": "τ",
            "&upsilon;": "υ",
            "&phi;": "φ",
            "&chi;": "χ",
            "&psi;": "ψ",
            "&omega;": "ω"
        };

        let result = text;
        for (const [entity, char] of Object.entries(entityMap)) {
            result = result.replaceAll(entity, char);
        }

        result = result.replace(/&#(\d+);/g, (match, dec) => {
            return String.fromCharCode(parseInt(dec, 10));
        });
        result = result.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
        });

        return result;
    }
}
