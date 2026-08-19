import { describe, expect, it, vi } from "vitest";
import { wrapSnippetAsLibrary } from "../dynamic-snippets/swift/DynamicSnippetsSwiftTestGenerator.js";

const TYPICAL_SNIPPET = `import Foundation
import SomeSDK

private func main() async throws {
    let client = SomeClient(
        baseURL: "https://api.example.com",
        token: "<token>"
    )

    _ = try await client.service.endpoint()
}
try await main()
`;

describe("wrapSnippetAsLibrary", () => {
    it("wraps a typical snippet in an enum with static method", () => {
        const warn = vi.fn();
        const result = wrapSnippetAsLibrary({ snippet: TYPICAL_SNIPPET, enumName: "Example0", warn });

        expect(result).toBe(`import Foundation
import SomeSDK

enum Example0 {
    static func snippet() async throws {
        let client = SomeClient(
            baseURL: "https://api.example.com",
            token: "<token>"
        )

        _ = try await client.service.endpoint()
    }
}
`);
        expect(warn).not.toHaveBeenCalled();
    });

    it("preserves empty lines inside the function body", () => {
        const snippet = `import Foundation

private func main() async throws {
    let a = 1

    let b = 2
}
try await main()
`;
        const warn = vi.fn();
        const result = wrapSnippetAsLibrary({ snippet, enumName: "Example1", warn });

        expect(result).toContain("    let a = 1");
        expect(result).toContain("");
        expect(result).toContain("    let b = 2");
        expect(warn).not.toHaveBeenCalled();
    });

    it("returns raw snippet and warns when func declaration is missing", () => {
        const snippet = `import Foundation

func doSomething() {
    print("hello")
}
`;
        const warn = vi.fn();
        const result = wrapSnippetAsLibrary({ snippet, enumName: "Example2", warn });

        expect(result).toBe(snippet);
        expect(warn).toHaveBeenCalledOnce();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("does not match expected format"));
    });

    it("returns raw snippet and warns when invocation is missing", () => {
        const snippet = `import Foundation

private func main() async throws {
    let client = SomeClient()
}
`;
        const warn = vi.fn();
        const result = wrapSnippetAsLibrary({ snippet, enumName: "Example3", warn });

        expect(result).toBe(snippet);
        expect(warn).toHaveBeenCalledOnce();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("missing expected"));
    });

    it("handles trailing whitespace on func declaration and invocation lines", () => {
        const snippet = `import Foundation

private func main() async throws {
    let x = 1
}
try await main()
`;
        const warn = vi.fn();
        const result = wrapSnippetAsLibrary({ snippet, enumName: "Example4", warn });

        expect(result).toContain("enum Example4 {");
        expect(result).toContain("    static func snippet() async throws {");
        expect(warn).not.toHaveBeenCalled();
    });

    it("uses the provided enum name", () => {
        const warn = vi.fn();
        const result = wrapSnippetAsLibrary({ snippet: TYPICAL_SNIPPET, enumName: "MyCustomName", warn });

        expect(result).toContain("enum MyCustomName {");
        expect(warn).not.toHaveBeenCalled();
    });

    it("strips trailing empty lines between closing brace and enum brace", () => {
        const snippet = `import Foundation

private func main() async throws {
    let x = 1
}

try await main()
`;
        const warn = vi.fn();
        const result = wrapSnippetAsLibrary({ snippet, enumName: "Example5", warn });

        // Blank line between } and invocation should not produce trailing empty lines before enum }
        expect(result).toBe(`import Foundation

enum Example5 {
    static func snippet() async throws {
        let x = 1
    }
}
`);
        expect(warn).not.toHaveBeenCalled();
    });
});
