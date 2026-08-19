import type { FdrAPI } from "@fern-api/fdr-sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { renderDocstring, renderSimpleDocstring } from "../renderers/DocstringRenderer";

const NEMO_FIXTURES: Record<string, FdrAPI.libraryDocs.DocstringIr> = JSON.parse(
    readFileSync(join(__dirname, "fixtures", "nemo-docstrings.json"), "utf-8")
);

/** Minimal empty docstring — all arrays present, optional fields undefined. */
function emptyDocstring(): FdrAPI.libraryDocs.DocstringIr {
    return {
        summary: undefined,
        description: undefined,
        params: [],
        returns: undefined,
        raises: [],
        examples: [],
        notes: [],
        warnings: []
    };
}

/** Build a docstring with only the fields you care about. */
function docstring(overrides: Partial<FdrAPI.libraryDocs.DocstringIr>): FdrAPI.libraryDocs.DocstringIr {
    return { ...emptyDocstring(), ...overrides };
}

describe("renderDocstring", () => {
    // --- Null / empty handling ---

    it("returns empty string for null", () => {
        expect(renderDocstring(null)).toBe("");
    });

    it("returns empty string for undefined", () => {
        expect(renderDocstring(undefined)).toBe("");
    });

    it("returns empty string for empty docstring (no sections)", () => {
        expect(renderDocstring(emptyDocstring())).toBe("");
    });

    // --- Description ---

    it("renders description with trailing blank line", () => {
        const result = renderDocstring(docstring({ description: "Hello world" }));
        expect(result).toBe("Hello world\n");
    });

    it("escapes JSX characters in description", () => {
        const result = renderDocstring(docstring({ description: "Use <T> for {generics}" }));
        expect(result).toContain("&lt;T&gt;");
        expect(result).toContain("&#123;generics&#125;");
    });

    it("wraps code blocks in description with CodeBlock component", () => {
        const desc = "Example:\n```python\nx = <T>\n```\nEnd.";
        const result = renderDocstring(docstring({ description: desc }));
        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
        expect(result).toContain("```python\nx = <T>\n```");
        expect(result).toContain("</CodeBlock>");
        expect(result).toContain("End.");
    });

    // --- Parameters ---

    it("renders parameters with ParamField components", () => {
        const result = renderDocstring(
            docstring({
                params: [{ name: "x", type: "int", description: "The x value", default: undefined }]
            })
        );
        expect(result).toContain("**Parameters:**");
        expect(result).toContain('<ParamField path="x" type="int">');
        expect(result).toContain("The x value");
        expect(result).toContain("</ParamField>");
    });

    it("uses paramAnnotations as fallback when docstring param has no type", () => {
        const result = renderDocstring(
            docstring({
                params: [{ name: "x", type: undefined, description: "A number", default: undefined }]
            }),
            { x: "float" }
        );
        expect(result).toContain('type="float"');
    });

    it("prefers docstring param type over paramAnnotations", () => {
        const result = renderDocstring(
            docstring({
                params: [{ name: "x", type: "int", description: undefined, default: undefined }]
            }),
            { x: "float" }
        );
        expect(result).toContain('type="int"');
        expect(result).not.toContain("float");
    });

    it("renders param default values", () => {
        const result = renderDocstring(
            docstring({
                params: [{ name: "x", type: "int", description: undefined, default: "42" }]
            })
        );
        expect(result).toContain('default="42"');
    });

    it("escapes JSX chars in param default values", () => {
        const result = renderDocstring(
            docstring({
                params: [{ name: "x", type: undefined, description: undefined, default: "<none>" }]
            })
        );
        expect(result).toContain('default="&lt;none&gt;"');
    });

    it("omits type attribute when no type is available", () => {
        const result = renderDocstring(
            docstring({
                params: [{ name: "x", type: undefined, description: "Untyped", default: undefined }]
            })
        );
        expect(result).toContain('<ParamField path="x">');
        expect(result).not.toContain("type=");
    });

    it("renders empty content for param with no description", () => {
        const result = renderDocstring(
            docstring({
                params: [{ name: "x", type: "int", description: undefined, default: undefined }]
            })
        );
        // ParamField should contain empty string between tags
        expect(result).toContain("<ParamField");
        expect(result).toContain("</ParamField>");
    });

    it("renders multiple parameters", () => {
        const result = renderDocstring(
            docstring({
                params: [
                    { name: "a", type: "int", description: "First", default: undefined },
                    { name: "b", type: "str", description: "Second", default: "'hello'" }
                ]
            })
        );
        expect(result).toContain('path="a"');
        expect(result).toContain('path="b"');
        expect(result).toContain("First");
        expect(result).toContain("Second");
        expect(result).toContain(`default="'hello'"`);
    });

    // --- Returns ---

    it("renders returns with type", () => {
        const result = renderDocstring(
            docstring({
                returns: { type: "bool", description: "True if valid" }
            })
        );
        expect(result).toContain("**Returns:** `bool`");
        expect(result).toContain("True if valid");
    });

    it("renders returns with returnAnnotation fallback", () => {
        const result = renderDocstring(
            docstring({
                returns: { type: undefined, description: "The result" }
            }),
            undefined,
            "int"
        );
        expect(result).toContain("**Returns:** `int`");
    });

    it("prefers docstring return type over returnAnnotation", () => {
        const result = renderDocstring(
            docstring({
                returns: { type: "str", description: undefined }
            }),
            undefined,
            "int"
        );
        expect(result).toContain("**Returns:** `str`");
        expect(result).not.toContain("`int`");
    });

    it("renders returns without type", () => {
        const result = renderDocstring(
            docstring({
                returns: { type: undefined, description: "Something" }
            })
        );
        expect(result).toContain("**Returns:**");
        expect(result).not.toContain("`");
    });

    it("renders returns without description", () => {
        const result = renderDocstring(
            docstring({
                returns: { type: "int", description: undefined }
            })
        );
        expect(result).toContain("**Returns:** `int`");
    });

    it("escapes JSX chars in return type", () => {
        const result = renderDocstring(
            docstring({
                returns: { type: "Optional<int>", description: undefined }
            })
        );
        expect(result).toContain("`Optional&lt;int&gt;`");
    });

    it("wraps code blocks in returns description with CodeBlock component", () => {
        const desc = 'Returns:\n```python\n{"key": <value>}\n```';
        const result = renderDocstring(
            docstring({
                returns: { type: "dict", description: desc }
            })
        );
        // Code block content should not be escaped
        expect(result).toContain('{"key": <value>}');
        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
        expect(result).toContain("</CodeBlock>");
    });

    // --- Raises ---

    it("renders raises section", () => {
        const result = renderDocstring(
            docstring({
                raises: [{ type: "ValueError", description: "If x is negative" }]
            })
        );
        expect(result).toContain("**Raises:**");
        expect(result).toContain("- `ValueError`: If x is negative");
    });

    it("renders raises without description", () => {
        const result = renderDocstring(
            docstring({
                raises: [{ type: "RuntimeError", description: undefined }]
            })
        );
        expect(result).toContain("- `RuntimeError`");
        // No trailing colon + description after the type
        expect(result).not.toContain("RuntimeError`: ");
    });

    it("renders multiple raises", () => {
        const result = renderDocstring(
            docstring({
                raises: [
                    { type: "ValueError", description: "Bad value" },
                    { type: "TypeError", description: "Wrong type" }
                ]
            })
        );
        expect(result).toContain("- `ValueError`: Bad value");
        expect(result).toContain("- `TypeError`: Wrong type");
    });

    it("escapes JSX chars in exception type and description", () => {
        const result = renderDocstring(
            docstring({
                raises: [{ type: "Error<T>", description: "When {x} fails" }]
            })
        );
        expect(result).toContain("`Error&lt;T&gt;`");
        expect(result).toContain("&#123;x&#125; fails");
    });

    // --- Examples ---

    it("renders examples with CodeBlock", () => {
        const result = renderDocstring(
            docstring({
                examples: [{ code: 'print("hello")', description: undefined }]
            })
        );
        expect(result).toContain("**Examples:**");
        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
        expect(result).toContain("```python");
        expect(result).toContain('print("hello")');
        expect(result).toContain("```");
        expect(result).toContain("</CodeBlock>");
    });

    it("renders example with description", () => {
        const result = renderDocstring(
            docstring({
                examples: [{ code: "x = 1", description: "Simple assignment" }]
            })
        );
        expect(result).toContain("Simple assignment");
        expect(result).toContain("x = 1");
    });

    it("wraps code blocks in example description with CodeBlock component", () => {
        const result = renderDocstring(
            docstring({
                examples: [{ code: "x = 1", description: "Use `<T>` like:\n```python\ny = <T>()\n```" }]
            })
        );
        // Inside code block: not escaped, and wrapped in CodeBlock
        expect(result).toContain("y = <T>()");
        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
    });

    it("renders multiple examples", () => {
        const result = renderDocstring(
            docstring({
                examples: [
                    { code: "x = 1", description: "First" },
                    { code: "x = 2", description: "Second" }
                ]
            })
        );
        expect(result).toContain("First");
        expect(result).toContain("x = 1");
        expect(result).toContain("Second");
        expect(result).toContain("x = 2");
    });

    // --- Notes ---

    it("renders notes in a Note component", () => {
        const result = renderDocstring(docstring({ notes: ["This is important."] }));
        expect(result).toContain("<Note>");
        expect(result).toContain("This is important.");
        expect(result).toContain("</Note>");
    });

    it("renders multiple notes", () => {
        const result = renderDocstring(docstring({ notes: ["Note 1", "Note 2"] }));
        expect(result).toContain("Note 1");
        expect(result).toContain("Note 2");
    });

    it("wraps code blocks in notes with CodeBlock component", () => {
        const result = renderDocstring(docstring({ notes: ["See:\n```python\nx = {val}\n```"] }));
        expect(result).toContain("x = {val}");
        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
        expect(result).toContain("</CodeBlock>");
    });

    // --- Warnings ---

    it("renders warnings in a Warning component", () => {
        const result = renderDocstring(docstring({ warnings: ["Be careful!"] }));
        expect(result).toContain("<Warning>");
        expect(result).toContain("Be careful!");
        expect(result).toContain("</Warning>");
    });

    it("wraps code blocks in warnings with CodeBlock component", () => {
        const result = renderDocstring(docstring({ warnings: ["Don't do:\n```python\nx = <bad>\n```"] }));
        expect(result).toContain("x = <bad>");
        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
        expect(result).toContain("</CodeBlock>");
    });

    // --- Combined sections ---

    it("renders all sections in correct order", () => {
        const result = renderDocstring(
            docstring({
                description: "A function.",
                params: [{ name: "x", type: "int", description: "Input", default: undefined }],
                returns: { type: "str", description: "Output" },
                raises: [{ type: "ValueError", description: "On error" }],
                examples: [{ code: "f(1)", description: undefined }],
                notes: ["Important note"],
                warnings: ["Watch out"]
            })
        );

        const descIdx = result.indexOf("A function.");
        const paramsIdx = result.indexOf("**Parameters:**");
        const returnsIdx = result.indexOf("**Returns:**");
        const raisesIdx = result.indexOf("**Raises:**");
        const examplesIdx = result.indexOf("**Examples:**");
        const noteIdx = result.indexOf("<Note>");
        const warningIdx = result.indexOf("<Warning>");

        expect(descIdx).toBeLessThan(paramsIdx);
        expect(paramsIdx).toBeLessThan(returnsIdx);
        expect(returnsIdx).toBeLessThan(raisesIdx);
        expect(raisesIdx).toBeLessThan(examplesIdx);
        expect(examplesIdx).toBeLessThan(noteIdx);
        expect(noteIdx).toBeLessThan(warningIdx);
    });

    it("only renders sections that have content", () => {
        const result = renderDocstring(
            docstring({
                description: "Just a description."
            })
        );
        expect(result).not.toContain("**Parameters:**");
        expect(result).not.toContain("**Returns:**");
        expect(result).not.toContain("**Raises:**");
        expect(result).not.toContain("**Examples:**");
        expect(result).not.toContain("<Note>");
        expect(result).not.toContain("<Warning>");
    });
});

describe("renderSimpleDocstring", () => {
    it("returns empty string for null", () => {
        expect(renderSimpleDocstring(null)).toBe("");
    });

    it("returns empty string for undefined", () => {
        expect(renderSimpleDocstring(undefined)).toBe("");
    });

    it("returns empty string when description is undefined", () => {
        expect(renderSimpleDocstring(emptyDocstring())).toBe("");
    });

    it("renders description text", () => {
        expect(renderSimpleDocstring(docstring({ description: "Module overview" }))).toBe("Module overview");
    });

    it("escapes JSX characters", () => {
        const result = renderSimpleDocstring(docstring({ description: "Use <T> and {x}" }));
        expect(result).toContain("&lt;T&gt;");
        expect(result).toContain("&#123;x&#125;");
    });

    it("wraps code blocks with CodeBlock component", () => {
        const desc = "Example:\n```python\nx = <T>\n```";
        const result = renderSimpleDocstring(docstring({ description: desc }));
        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
        expect(result).toContain("```python\nx = <T>\n```");
        expect(result).toContain("</CodeBlock>");
    });

    it("ignores structured sections (params, returns, etc.)", () => {
        const result = renderSimpleDocstring(
            docstring({
                description: "Just text",
                params: [{ name: "x", type: "int", description: "Ignored", default: undefined }],
                returns: { type: "str", description: "Also ignored" }
            })
        );
        expect(result).toBe("Just text");
        expect(result).not.toContain("Ignored");
    });
});

describe("renderDocstring (NeMo fixtures)", () => {
    it("get_tokenizer: renders params, returns, and example", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const ds = NEMO_FIXTURES["get_tokenizer"]!;
        const result = renderDocstring(ds);

        // Description
        expect(result).toContain("Get the tokenizer and set pad token");
        expect(result).toContain("Hugging Face transformers library");

        // Params
        expect(result).toContain("**Parameters:**");
        expect(result).toContain('path="tokenizer_config"');
        expect(result).toContain('type="TokenizerConfig"');
        expect(result).toContain('path="get_processor"');
        expect(result).toContain('type="bool"');
        expect(result).toContain('default="False"');

        // Returns
        expect(result).toContain("**Returns:** `PreTrainedTokenizerBase`");
        expect(result).toContain("The configured tokenizer instance");

        // Example
        expect(result).toContain("**Examples:**");
        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
        expect(result).toContain("get_tokenizer(config)");
    });

    it("validate_tensor_consistency: renders params and raises", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const ds = NEMO_FIXTURES["validate_tensor_consistency"]!;
        const result = renderDocstring(ds);

        // Description
        expect(result).toContain("Validate that all tensors have consistent dtypes and devices.");

        // Params
        expect(result).toContain('path="tensors"');
        expect(result).toContain('type="list[Tensor]"');

        // Raises
        expect(result).toContain("**Raises:**");
        expect(result).toContain("- `RuntimeError`: If tensors have different dtypes or devices");

        // No returns section
        expect(result).not.toContain("**Returns:**");
    });

    it("eval_collate_fn: wraps code block in description with CodeBlock", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const ds = NEMO_FIXTURES["eval_collate_fn"]!;
        const result = renderDocstring(ds);

        // Code block in description should be wrapped in CodeBlock, with {doctest} normalized to python
        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
        expect(result).toContain("```python");
        expect(result).not.toContain("{doctest}");
        expect(result).toContain(">>> import torch");
        expect(result).toContain("</CodeBlock>");
        // Curly braces inside code block should NOT be escaped
        expect(result).toContain("{'role': 'user'");

        // Params
        expect(result).toContain('path="data_batch"');

        // Returns
        expect(result).toContain("**Returns:** `BatchedDataDict[Any]`");
    });

    it("clipped_pg_loss: description-only with math notation", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const ds = NEMO_FIXTURES["clipped_pg_loss"]!;
        const result = renderDocstring(ds);

        // Should render description
        expect(result).toContain("Generalized Clipped Policy Gradient");
        expect(result).toContain("L(θ)");

        // LaTeX-like $ should be preserved (not a JSX char)
        expect(result).toContain("$rA");
        expect(result).toContain("$cA$");

        // No structured sections
        expect(result).not.toContain("**Parameters:**");
        expect(result).not.toContain("**Returns:**");
        expect(result).not.toContain("**Raises:**");
        expect(result).not.toContain("**Examples:**");
    });
});

describe("renderSimpleDocstring (NeMo fixtures)", () => {
    it("renders only description text, ignoring structured sections", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const ds = NEMO_FIXTURES["get_tokenizer"]!;
        const result = renderSimpleDocstring(ds);

        expect(result).toContain("Get the tokenizer");
        // Should NOT contain param/returns rendering
        expect(result).not.toContain("**Parameters:**");
        expect(result).not.toContain("**Returns:**");
        expect(result).not.toContain("<ParamField");
    });

    it("wraps code block in eval_collate_fn description with CodeBlock", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const ds = NEMO_FIXTURES["eval_collate_fn"]!;
        const result = renderSimpleDocstring(ds);

        expect(result).toContain("<CodeBlock showLineNumbers={false}>");
        expect(result).toContain("```python");
        expect(result).not.toContain("{doctest}");
        expect(result).toContain(">>> import torch");
        expect(result).toContain("</CodeBlock>");
    });
});
