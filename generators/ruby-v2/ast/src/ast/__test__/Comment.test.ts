import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { Writer } from "../core/Writer";

describe("Comment", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };
    });

    test("does not write a comment with no content", () => {
        const comment = ruby.comment({});

        expect(comment.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes single-line comments", () => {
        const comment = ruby.comment({ docs: "Hello there" });

        expect(comment.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes multi-line comments", () => {
        const comment = ruby.comment({ docs: "Hello\nthere" });

        expect(comment.toString(writerConfig)).toMatchSnapshot();
    });

    test("wraps long lines to fit within RuboCop line length limit", () => {
        const longText =
            "This is a very long comment that exceeds the RuboCop default line length limit of 120 characters and should be wrapped to multiple lines automatically.";
        const comment = ruby.comment({ docs: longText });

        expect(comment.toString(writerConfig)).toMatchSnapshot();
    });

    test("wraps very long lines from OpenAPI descriptions", () => {
        const openApiDescription =
            "The API endpoint allows you to retrieve detailed information about a specific resource including all of its properties, relationships, and metadata. This endpoint supports pagination, filtering, and sorting options to help you efficiently query large datasets.";
        const comment = ruby.comment({ docs: openApiDescription });

        expect(comment.toString(writerConfig)).toMatchSnapshot();
    });

    test("preserves existing line breaks while wrapping long lines", () => {
        const textWithLineBreaks =
            "First paragraph that is short.\nSecond paragraph that is very long and exceeds the RuboCop default line length limit of 120 characters and should be wrapped to multiple lines automatically.";
        const comment = ruby.comment({ docs: textWithLineBreaks });

        expect(comment.toString(writerConfig)).toMatchSnapshot();
    });

    test("handles lines that are exactly at the limit", () => {
        const exactLengthText = "A".repeat(118); // 118 chars + "# " = 120 chars exactly
        const comment = ruby.comment({ docs: exactLengthText });

        expect(comment.toString(writerConfig)).toMatchSnapshot();
    });

    test("handles very long words like URLs without breaking them", () => {
        const textWithUrl =
            "See the documentation at https://example.com/very/long/path/to/documentation/that/exceeds/the/line/length/limit/significantly for more information.";
        const comment = ruby.comment({ docs: textWithUrl });

        expect(comment.toString(writerConfig)).toMatchSnapshot();
    });
});
