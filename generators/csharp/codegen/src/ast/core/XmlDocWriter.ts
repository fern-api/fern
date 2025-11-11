import { AbstractAstNode } from "@fern-api/browser-compatible-base-generator";
import { XmlDocBlock } from "../language/XmlDocBlock";
import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

export class XmlDocWriter {
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
        text = this.decodeHtmlEntities(text);
        return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
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
