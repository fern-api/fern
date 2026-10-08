import type { XmlSerializable } from "./serialize";

/** An XML comment (`<!--text-->`), kept in an element's ordered content like a text segment or child element. */
export class XmlComment implements XmlSerializable {
    constructor(public text: string) {}

    public toXml(): string {
        return `<!--${xmlCommentText(this.text)}-->`;
    }

    public toString(): string {
        return this.toXml();
    }
}

/**
 * Makes text safe to place inside a comment: XML forbids `--` within a comment and a trailing `-`,
 * and either would otherwise end the comment early and turn the rest into markup.
 */
export function xmlCommentText(text: string): string {
    const safe = text.replace(/-(?=-)/g, "- ");
    return safe.endsWith("-") ? `${safe} ` : safe;
}

export function isXmlComment(value: unknown): value is XmlComment {
    return value instanceof XmlComment;
}

/** Comments rendered as siblings of an element: before its start tag and after its end tag. */
export interface XmlSiblingCommentList {
    readonly before: readonly XmlComment[];
    readonly after: readonly XmlComment[];
}

const siblingCommentsByModel = new WeakMap<object, XmlSiblingCommentList>();

/**
 * Remembers the sibling comments a builder carried for the model it built, so a model rendered
 * from a typed child list (e.g. inside a wrapper element) keeps the comments around it.
 */
export function rememberXmlSiblingComments(model: unknown, comments: XmlSiblingCommentList | undefined): void {
    if (typeof model === "object" && model != null && comments != null) {
        if (comments.before.length > 0 || comments.after.length > 0) {
            siblingCommentsByModel.set(model, comments);
        }
    }
}

export function xmlSiblingCommentsOf(model: unknown): XmlSiblingCommentList | undefined {
    return typeof model === "object" && model != null ? siblingCommentsByModel.get(model) : undefined;
}
