import { describe, expect, it } from "vitest";
import {
    E0301_JSX_ATTRIBUTE_NEEDS_BRACES,
    E0302_UNTERMINATED_STRING_LITERAL,
    E0303_MISMATCHED_CLOSING_TAG,
    E0304_UNCLOSED_JSX_ELEMENT,
    E0305_INVALID_JS_EXPRESSION
} from "../docs/errors/MdxErrorCode.js";

describe("MdxErrorCode suggestFix", () => {
    describe("E0301 - JSX attribute needs braces", () => {
        it("wraps JSX element attribute in braces", () => {
            const fix = E0301_JSX_ATTRIBUTE_NEEDS_BRACES.suggestFix?.({
                errorLineContent: '<Card icon=<Icon /> title="test" />',
                rawMessage: "Cannot use element or fragment as a prop value"
            });
            expect(fix).toEqual({
                before: "icon=<Icon />",
                after: "icon={<Icon />}"
            });
        });

        it("returns undefined for non-matching lines", () => {
            const fix = E0301_JSX_ATTRIBUTE_NEEDS_BRACES.suggestFix?.({
                errorLineContent: '<Card title="test" />',
                rawMessage: "Cannot use element or fragment as a prop value"
            });
            expect(fix).toBeUndefined();
        });
    });

    describe("E0302 - Unterminated string literal", () => {
        it("closes an unterminated double-quoted attribute", () => {
            const fix = E0302_UNTERMINATED_STRING_LITERAL.suggestFix?.({
                errorLineContent: '<Input placeholder="Enter your name',
                rawMessage: "Unexpected end of file in attribute value"
            });
            expect(fix).toBeDefined();
            expect(fix?.before).toBe('placeholder="Enter your name');
            expect(fix?.after).toBe('placeholder="Enter your name"');
        });

        it("closes an unterminated single-quoted attribute", () => {
            const fix = E0302_UNTERMINATED_STRING_LITERAL.suggestFix?.({
                errorLineContent: "<Input placeholder='Enter your name",
                rawMessage: "Unexpected end of file in attribute value"
            });
            expect(fix).toBeDefined();
            expect(fix?.after?.endsWith("'")).toBe(true);
        });

        it("returns undefined when quotes are balanced", () => {
            const fix = E0302_UNTERMINATED_STRING_LITERAL.suggestFix?.({
                errorLineContent: '<Input placeholder="name" />',
                rawMessage: "Unexpected end of file in attribute value"
            });
            expect(fix).toBeUndefined();
        });
    });

    describe("E0303 - Mismatched closing tag", () => {
        it("suggests replacing the wrong closing tag", () => {
            const fix = E0303_MISMATCHED_CLOSING_TAG.suggestFix?.({
                errorLineContent: "</Bar>",
                rawMessage: "Unexpected closing tag `</Bar>`, expected closing tag `</Foo>`"
            });
            expect(fix).toEqual({
                before: "</Bar>",
                after: "</Foo>"
            });
        });

        it("returns undefined when no expected tag in message", () => {
            const fix = E0303_MISMATCHED_CLOSING_TAG.suggestFix?.({
                errorLineContent: "</Bar>",
                rawMessage: "Unexpected closing tag found"
            });
            expect(fix).toBeUndefined();
        });
    });

    describe("E0304 - Unclosed JSX element", () => {
        it("self-closes a bare tag", () => {
            const fix = E0304_UNCLOSED_JSX_ELEMENT.suggestFix?.({
                errorLineContent: "<MyComponent",
                rawMessage: "Unexpected end of file in tag"
            });
            expect(fix).toEqual({
                before: "<MyComponent",
                after: "<MyComponent />"
            });
        });

        it("self-closes a tag with attributes", () => {
            const fix = E0304_UNCLOSED_JSX_ELEMENT.suggestFix?.({
                errorLineContent: '<Icon name="star"',
                rawMessage: "Unexpected end of file in element"
            });
            expect(fix).toBeDefined();
            expect(fix?.after?.endsWith(" />")).toBe(true);
        });

        it("returns undefined for closed tags", () => {
            const fix = E0304_UNCLOSED_JSX_ELEMENT.suggestFix?.({
                errorLineContent: "<Icon />",
                rawMessage: "Unexpected end of file in element"
            });
            expect(fix).toBeUndefined();
        });
    });

    describe("E0305 - Invalid JS expression", () => {
        it("escapes a lone opening brace", () => {
            const fix = E0305_INVALID_JS_EXPRESSION.suggestFix?.({
                errorLineContent: "Use the { operator to destructure",
                rawMessage: "Could not parse expression with acorn"
            });
            expect(fix).toEqual({
                before: "{",
                after: "\\{"
            });
        });

        it("escapes a lone closing brace", () => {
            const fix = E0305_INVALID_JS_EXPRESSION.suggestFix?.({
                errorLineContent: "Returns a map of key => value }",
                rawMessage: "Could not parse expression with acorn"
            });
            expect(fix).toEqual({
                before: "}",
                after: "\\}"
            });
        });

        it("returns undefined when braces are balanced", () => {
            const fix = E0305_INVALID_JS_EXPRESSION.suggestFix?.({
                errorLineContent: "const x = { foo: bar }",
                rawMessage: "Could not parse expression with acorn"
            });
            expect(fix).toBeUndefined();
        });
    });
});
