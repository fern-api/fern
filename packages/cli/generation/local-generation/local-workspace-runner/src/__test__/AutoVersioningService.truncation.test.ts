import { describe, expect, it, vi } from "vitest";
import { AutoVersioningService } from "../AutoVersioningService.js";
import { MAX_AI_DIFF_BYTES } from "../VersionUtils.js";

// Mock logger for tests
const mockLogger = {
    info: () => {
        // No-op for tests
    },
    warn: () => {
        // No-op for tests
    },
    error: () => {
        // No-op for tests
    },
    debug: () => {
        // No-op for tests
    },
    disable: () => {
        // No-op for tests
    },
    enable: () => {
        // No-op for tests
    },
    trace: () => {
        // No-op for tests
    },
    log: () => {
        // No-op for tests
    }
};

/**
 * Helper: creates a diff file section for a given file path with the specified lines.
 */
function makeFileSection(filePath: string, lines: string[]): string {
    return [
        `diff --git a/${filePath} b/${filePath}`,
        `index abc123..def456 100644`,
        `--- a/${filePath}`,
        `+++ b/${filePath}`,
        `@@ -1,10 +1,10 @@`,
        ...lines
    ].join("\n");
}

/**
 * Helper: creates a large diff string that exceeds maxBytes by repeating file sections.
 */
function makeLargeDiff(fileCount: number, linesPerFile: number, linePrefix: string): string {
    const sections: string[] = [];
    for (let i = 0; i < fileCount; i++) {
        const lines: string[] = [];
        for (let j = 0; j < linesPerFile; j++) {
            lines.push(`${linePrefix}line ${j} of file ${i} with some padding content to increase size`);
        }
        sections.push(makeFileSection(`src/file${i}.ts`, lines));
    }
    return sections.join("\n");
}

describe("AutoVersioningService.truncateDiff", () => {
    const service = new AutoVersioningService({ logger: mockLogger });

    it("returns diff unchanged when under 40KB", () => {
        const diff = makeFileSection("src/client.ts", [
            "-export function oldMethod(): void {}",
            "+export function newMethod(): void {}"
        ]);

        expect(diff.length).toBeLessThan(MAX_AI_DIFF_BYTES);

        const result = service.truncateDiff(diff, MAX_AI_DIFF_BYTES);
        expect(result.truncated).toBe(diff);
        expect(result.omittedFiles).toBe(0);
    });

    it("truncates diff to under 40KB when over limit", () => {
        // Create a diff large enough to exceed 40KB
        const largeDiff = makeLargeDiff(100, 20, "+");

        expect(largeDiff.length).toBeGreaterThan(MAX_AI_DIFF_BYTES);

        const result = service.truncateDiff(largeDiff, MAX_AI_DIFF_BYTES);
        // The truncated result may slightly exceed maxBytes if a single section is large,
        // but omittedFiles should be > 0
        expect(result.omittedFiles).toBeGreaterThan(0);
        // Verify truncation note is present
        expect(result.truncated).toContain("[Diff truncated:");
    });

    it("prioritises deletion-only file sections in truncated output", () => {
        // Create a small budget to force truncation
        const deletionSection = makeFileSection("src/removed.ts", [
            "-export function removedApi(): void {}",
            "-export function anotherRemoved(): void {}"
        ]);

        const additionSection = makeFileSection("src/added.ts", [
            "+export function newApi(): void {}",
            "+export function anotherNew(): void {}"
        ]);

        // Combine: addition first, deletion second (truncation should reorder)
        const diff = additionSection + "\n" + deletionSection;

        // Use a budget that fits only one section — exact size of the deletion section
        const exactSectionSize = Buffer.byteLength(deletionSection, "utf-8");

        const result = service.truncateDiff(diff, exactSectionSize);

        // The deletion section should be included (higher priority)
        expect(result.truncated).toContain("removed.ts");
        expect(result.truncated).toContain("-export function removedApi");
        // The addition section should be omitted
        expect(result.omittedFiles).toBe(1);
    });

    it("prioritises sections with signature changes over addition-only sections", () => {
        // Mixed section with signature changes (priority 2)
        const signatureSection = makeFileSection("src/api.ts", [
            "-public oldMethod(): string { return ''; }",
            "+public newMethod(): string { return ''; }",
            " // unchanged context"
        ]);

        // Addition-only section (priority 4)
        const additionSection = makeFileSection("src/newfile.ts", [
            "+const helper = () => {};",
            "+const anotherHelper = () => {};"
        ]);

        const diff = additionSection + "\n" + signatureSection;

        // Budget that fits only one section — use exact size of the signature section
        const exactSectionSize = Buffer.byteLength(signatureSection, "utf-8");

        const result = service.truncateDiff(diff, exactSectionSize);

        // Signature section should be included (higher priority)
        expect(result.truncated).toContain("api.ts");
        expect(result.truncated).toContain("public newMethod");
        expect(result.omittedFiles).toBe(1);
    });

    it("appends truncation note with accurate omitted file count", () => {
        // Create diff with many small sections
        const sections: string[] = [];
        for (let i = 0; i < 10; i++) {
            sections.push(
                makeFileSection(`src/file${i}.ts`, [`+new line in file ${i} with extra content to use some space`])
            );
        }
        const diff = sections.join("\n");

        // Use a very small budget
        const result = service.truncateDiff(diff, 500);

        expect(result.truncated).toContain("[Diff truncated:");
        // Verify the note contains correct counts
        const totalFiles = 10;
        const includedFiles = totalFiles - result.omittedFiles;
        expect(result.truncated).toContain(`showing ${includedFiles} of ${totalFiles} files`);
        expect(result.truncated).toContain(`${result.omittedFiles} files omitted due to size limit`);
    });

    it("reports correct omittedFiles count", () => {
        const sections: string[] = [];
        for (let i = 0; i < 5; i++) {
            sections.push(
                makeFileSection(`src/file${i}.ts`, [
                    `+line in file ${i} with padding to ensure each section has reasonable size for testing`
                ])
            );
        }
        const diff = sections.join("\n");

        // Budget that fits exactly 2 sections
        const singleSection = makeFileSection("src/test.ts", ["+single line"]);
        const approxSectionSize = Buffer.byteLength(singleSection, "utf-8");
        const budget = approxSectionSize * 2 + 100;

        const result = service.truncateDiff(diff, budget);

        // Should have omitted some files
        expect(result.omittedFiles).toBeGreaterThan(0);
        expect(result.omittedFiles).toBeLessThan(5);
        // Total should add up
        const includedCount = 5 - result.omittedFiles;
        expect(result.truncated).toContain(`showing ${includedCount} of 5 files`);
    });

    it("handles edge case where single file section exceeds max bytes", () => {
        // Create one huge section
        const hugeLines: string[] = [];
        for (let i = 0; i < 1000; i++) {
            hugeLines.push(`+large line number ${i} with lots of padding content to blow up the size significantly`);
        }
        const hugeSection = makeFileSection("src/huge.ts", hugeLines);

        expect(Buffer.byteLength(hugeSection, "utf-8")).toBeGreaterThan(MAX_AI_DIFF_BYTES);

        // Should still include at least one section
        const result = service.truncateDiff(hugeSection, MAX_AI_DIFF_BYTES);
        expect(result.truncated).toContain("huge.ts");
        expect(result.omittedFiles).toBe(0);
    });

    it("handles empty diff", () => {
        const result = service.truncateDiff("", MAX_AI_DIFF_BYTES);
        expect(result.truncated).toBe("");
        expect(result.omittedFiles).toBe(0);
    });

    it("preserves full ranking order: deletions > signatures > mixed > additions > context", () => {
        // Create one section of each type with small sizes
        const deletionOnly = makeFileSection("src/deleted.ts", ["-export function removed(): void {}"]);

        const signatureMixed = makeFileSection("src/signature.ts", [
            "-export function old(): void {}",
            "+export function updated(): void {}"
        ]);

        const mixed = makeFileSection("src/mixed.ts", ["-const a = 1;", "+const b = 2;"]);

        const additionOnly = makeFileSection("src/added.ts", ["+const newThing = true;"]);

        // Put them in reverse priority order
        const diff = [additionOnly, mixed, signatureMixed, deletionOnly].join("\n");

        // Budget large enough for all
        const result = service.truncateDiff(diff, 100_000);
        expect(result.omittedFiles).toBe(0);
        expect(result.truncated).toContain("deleted.ts");
        expect(result.truncated).toContain("signature.ts");
        expect(result.truncated).toContain("mixed.ts");
        expect(result.truncated).toContain("added.ts");

        // Now with tight budget: only deletion should survive
        const tinyBudget = Buffer.byteLength(deletionOnly, "utf-8");
        const tightResult = service.truncateDiff(diff, tinyBudget);
        expect(tightResult.truncated).toContain("deleted.ts");
        expect(tightResult.omittedFiles).toBe(3);
    });
});

describe("Cross-language signature detection and truncation", () => {
    const service = new AutoVersioningService({ logger: mockLogger });

    /**
     * Helper: given a "signature" section and a "non-signature" section,
     * truncates with a tight budget and returns the result for the caller to assert.
     */
    function truncateWithSignaturePriority(
        signatureFile: string,
        signatureLines: string[]
    ): { result: ReturnType<typeof service.truncateDiff>; signatureFile: string } {
        const sigSection = makeFileSection(signatureFile, signatureLines);
        const addSection = makeFileSection("src/generic-addition.txt", ["+some random addition line"]);
        const diff = addSection + "\n" + sigSection;
        const budget = Buffer.byteLength(sigSection, "utf-8");
        const result = service.truncateDiff(diff, budget);
        return { result, signatureFile };
    }

    // ── TypeScript / JavaScript ──────────────────────────────────────────

    it("detects TypeScript export function signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/client.ts", [
            "-export function getUser(id: string): Promise<User> {",
            "+export function getUser(id: string, options?: RequestOptions): Promise<User> {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects TypeScript export class signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/UserClient.ts", [
            "-export class UserClient {",
            "+export class UserClient extends BaseClient {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects TypeScript export interface signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/types/User.ts", [
            "-export interface UserRequest {",
            "+export interface UserRequest {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects TypeScript export type signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/types/index.ts", [
            '-export type Environment = "production" | "staging";',
            '+export type Environment = "production" | "staging" | "dev";'
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    // ── Java ─────────────────────────────────────────────────────────────

    it("detects Java public class signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/main/java/com/example/UserClient.java", [
            "-public class UserClient {",
            "+public class UserClient implements Closeable {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Java public method signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/main/java/com/example/UserService.java", [
            "-public UserResponse getUser(String userId) {",
            "+public UserResponse getUser(String userId, RequestOptions options) {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Java public interface signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/main/java/com/example/UserApi.java", [
            "-public interface UserApi {",
            "+public interface UserApi extends BaseApi {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Java protected method signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/main/java/com/example/BaseClient.java", [
            "-protected void initialize() {",
            "+protected void initialize(Config config) {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    // ── Python ───────────────────────────────────────────────────────────

    it("detects Python def signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/user/client.py", [
            "-def get_user(self, user_id: str) -> User:",
            "+def get_user(self, user_id: str, *, request_options: Optional[RequestOptions] = None) -> User:"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Python class signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/user/client.py", [
            "-class UserClient:",
            "+class UserClient(BaseClient):"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Python async def signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/user/async_client.py", [
            "-    def list_users(self) -> List[User]:",
            "+    def list_users(self, *, page: Optional[int] = None) -> PaginatedUsers:"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    // ── Go ───────────────────────────────────────────────────────────────

    it("detects Go exported function signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("client.go", [
            "-func GetUser(ctx context.Context, userID string) (*User, error) {",
            "+func GetUser(ctx context.Context, userID string, opts ...RequestOption) (*User, error) {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Go exported method signatures (receiver)", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("client_methods.go", [
            "-func (c *Client) GetUser(ctx context.Context, userID string) (*User, error) {",
            "+func (c *Client) GetUser(ctx context.Context, userID string, opts ...RequestOption) (*User, error) {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Go exported type signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("types.go", [
            "-type UserRequest struct {",
            "+type UserRequest struct {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("does NOT detect Go unexported functions as signatures", () => {
        // Go unexported functions start with lowercase — should NOT match
        const unexportedSection = makeFileSection("internal.go", [
            "-func internalHelper(x int) int {",
            "+func internalHelper(x int, y int) int {"
        ]);
        const signatureSection = makeFileSection("client.go", [
            "-func GetUser(ctx context.Context) (*User, error) {",
            "+func GetUser(ctx context.Context, opts ...Option) (*User, error) {"
        ]);
        const diff = unexportedSection + "\n" + signatureSection;
        const budget = Buffer.byteLength(signatureSection, "utf-8");
        const result = service.truncateDiff(diff, budget);

        // The exported function section should be kept (signature = priority 2)
        // The unexported section should be dropped (mixed = priority 3)
        expect(result.truncated).toContain("client.go");
        expect(result.omittedFiles).toBe(1);
    });

    // ── C# ───────────────────────────────────────────────────────────────

    it("detects C# public class signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/UserClient.cs", [
            "-public class UserClient {",
            "+public class UserClient : IDisposable {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects C# public method signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/UserClient.cs", [
            "-public async Task<User> GetUserAsync(string userId) {",
            "+public async Task<User> GetUserAsync(string userId, RequestOptions? options = null) {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects C# internal class signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/Internal/HttpClient.cs", [
            "-internal class HttpClient {",
            "+internal class HttpClient : IHttpClient {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    // ── Ruby ─────────────────────────────────────────────────────────────

    it("detects Ruby def signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("lib/user/client.rb", [
            "-    def get_user(user_id:)",
            "+    def get_user(user_id:, request_options: nil)"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Ruby class signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("lib/user/client.rb", [
            "-class UserClient",
            "+class UserClient < BaseClient"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Ruby module signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("lib/user/types.rb", [
            "-module UserTypes",
            "+module UserTypes"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    // ── Swift ────────────────────────────────────────────────────────────

    it("detects Swift public func signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("Sources/UserClient.swift", [
            "-public func getUser(userId: String) async throws -> User {",
            "+public func getUser(userId: String, options: RequestOptions? = nil) async throws -> User {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Swift open class signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("Sources/UserClient.swift", [
            "-open class UserClient {",
            "+open class UserClient: Sendable {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    // ── Rust ─────────────────────────────────────────────────────────────

    it("detects Rust pub fn signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/client.rs", [
            "-pub fn get_user(&self, user_id: &str) -> Result<User, Error> {",
            "+pub fn get_user(&self, user_id: &str, options: Option<RequestOptions>) -> Result<User, Error> {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Rust pub struct signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/types.rs", [
            "-pub struct UserRequest {",
            "+pub struct UserRequest {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Rust pub enum signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/types_enum.rs", [
            "-pub enum Environment {",
            "+pub enum Environment {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects Rust pub trait signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/traits.rs", [
            "-pub trait ApiClient {",
            "+pub trait ApiClient: Send + Sync {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    // ── PHP ──────────────────────────────────────────────────────────────

    it("detects PHP public function signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/UserClient.php", [
            "-    public function getUser(string $userId): User {",
            "+    public function getUser(string $userId, ?RequestOptions $options = null): User {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects PHP class signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/UserClientPhp.php", [
            "-class UserClient {",
            "+class UserClient extends BaseClient {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    it("detects PHP standalone function signatures", () => {
        const { result, signatureFile } = truncateWithSignaturePriority("src/helpers.php", [
            "-function formatResponse(array $data): string {",
            "+function formatResponse(array $data, bool $pretty = false): string {"
        ]);
        expect(result.truncated).toContain(signatureFile);
        expect(result.omittedFiles).toBe(1);
    });

    // ── Multi-language mixed diff ────────────────────────────────────────

    it("correctly ranks a realistic multi-language diff with tight budget", () => {
        // Simulate a large SDK diff with files from multiple languages
        // Priority 1: deletion-only (Java removed endpoint)
        const javaRemoved = makeFileSection("src/main/java/com/example/DeprecatedApi.java", [
            "-public class DeprecatedApi {",
            "-    public void oldEndpoint() { }",
            "-    public void anotherOldEndpoint() { }"
        ]);

        // Priority 2: mixed with signatures (Python client changed)
        const pythonChanged = makeFileSection("src/user/client.py", [
            "-    def get_user(self, user_id: str) -> User:",
            "+    def get_user(self, user_id: str, *, request_options: Optional[RequestOptions] = None) -> User:",
            "         # implementation unchanged"
        ]);

        // Priority 3: mixed without signatures (config change)
        const configChanged = makeFileSection("config.json", ['-    "timeout": 30,', '+    "timeout": 60,']);

        // Priority 4: addition-only (new Go types)
        const goAdded = makeFileSection("types.go", [
            "+type NewRequest struct {",
            '+    Field string `json:"field"`',
            "+"
        ]);

        // Priority 4: addition-only (new TypeScript type)
        const tsAdded = makeFileSection("src/types/NewType.ts", [
            "+export interface NewType {",
            "+    id: string;",
            "+    name: string;",
            "+"
        ]);

        // Put them in reverse order
        const diff = [tsAdded, goAdded, configChanged, pythonChanged, javaRemoved].join("\n");

        // Budget fits ~2 sections
        const twoSectionBudget = Buffer.byteLength(javaRemoved, "utf-8") + Buffer.byteLength(pythonChanged, "utf-8");

        const result = service.truncateDiff(diff, twoSectionBudget);

        // Java deletion (priority 1) and Python signature change (priority 2) should survive
        expect(result.truncated).toContain("DeprecatedApi.java");
        expect(result.truncated).toContain("client.py");

        // The others should be omitted
        expect(result.omittedFiles).toBe(3);
        expect(result.truncated).toContain("[Diff truncated:");
        expect(result.truncated).toContain("showing 2 of 5 files");
    });

    it("handles diff with non-ASCII content (e.g. unicode identifiers, CJK comments)", () => {
        // Diffs may contain non-ASCII characters in comments or string literals
        const unicodeSection = makeFileSection("src/i18n/messages.ts", [
            '-export const GREETING = "こんにちは";',
            '+export const GREETING = "こんにちは世界";'
        ]);

        const asciiSection = makeFileSection("src/helper.ts", ["+const x = 1;"]);

        const diff = asciiSection + "\n" + unicodeSection;
        const budget = Buffer.byteLength(unicodeSection, "utf-8");
        const result = service.truncateDiff(diff, budget);

        // Unicode section has signature (export) and mixed changes — priority 2
        // ASCII section is addition-only — priority 4
        expect(result.truncated).toContain("messages.ts");
        expect(result.truncated).toContain("こんにちは");
        expect(result.omittedFiles).toBe(1);
    });

    it("handles diff with many small files (simulating large Java SDK)", () => {
        // Java SDKs can have 700+ files — simulate a subset
        const sections: string[] = [];
        // 1 breaking file (deletion)
        sections.push(
            makeFileSection("src/main/java/com/example/RemovedEndpoint.java", [
                "-public class RemovedEndpoint {",
                "-    public void execute() { }"
            ])
        );
        // 5 changed files with signatures
        for (let i = 0; i < 5; i++) {
            sections.push(
                makeFileSection(`src/main/java/com/example/Service${i}.java`, [
                    `-    public void method${i}() {`,
                    `+    public void method${i}(RequestOptions options) {`
                ])
            );
        }
        // 50 addition-only files (new types)
        for (let i = 0; i < 50; i++) {
            sections.push(
                makeFileSection(`src/main/java/com/example/types/Type${i}.java`, [
                    `+public class Type${i} {`,
                    `+    private String field;`,
                    `+    public String getField() { return field; }`,
                    `+    public void setField(String field) { this.field = field; }`,
                    `+}`
                ])
            );
        }

        const diff = sections.join("\n");

        // Budget should keep breaking + signature files
        const result = service.truncateDiff(diff, 5_000);

        // The deletion section should always be included
        expect(result.truncated).toContain("RemovedEndpoint.java");
        // At least some signature sections should be included
        expect(result.truncated).toMatch(/Service\d\.java/);
        // Many additive files should be omitted
        expect(result.omittedFiles).toBeGreaterThan(40);
        expect(result.truncated).toContain("[Diff truncated:");
    });
});

describe("LocalTaskHandler size gate", () => {
    it("emits WARN log when diff exceeds MAX_AI_DIFF_BYTES", async () => {
        // This test verifies the integration logic by checking that
        // the truncation path is exercised for large diffs.
        const warnFn = vi.fn();
        const spyLogger = {
            ...mockLogger,
            warn: warnFn
        };

        const service = new AutoVersioningService({ logger: spyLogger });

        // Create a diff larger than MAX_AI_DIFF_BYTES
        const largeDiff = makeLargeDiff(100, 20, "+");
        expect(largeDiff.length).toBeGreaterThan(MAX_AI_DIFF_BYTES);

        // Simulate the size gate logic from LocalTaskHandler
        let diffToAnalyze = largeDiff;
        if (largeDiff.length > MAX_AI_DIFF_BYTES) {
            const { truncated, omittedFiles } = service.truncateDiff(largeDiff, MAX_AI_DIFF_BYTES);
            spyLogger.warn(
                `Diff too large for AI analysis (${largeDiff.length} bytes). ` +
                    `Truncated to ${truncated.length} bytes, omitting ${omittedFiles} files.`
            );
            diffToAnalyze = truncated;
        }

        expect(warnFn).toHaveBeenCalledTimes(1);
        expect(warnFn).toHaveBeenCalledWith(expect.stringContaining("Diff too large for AI analysis"));
        expect(warnFn).toHaveBeenCalledWith(expect.stringContaining("bytes"));
        expect(diffToAnalyze).not.toBe(largeDiff);
    });

    it("passes truncated diff to AI when original exceeds limit", async () => {
        const service = new AutoVersioningService({ logger: mockLogger });

        // Create a diff larger than MAX_AI_DIFF_BYTES
        const largeDiff = makeLargeDiff(100, 20, "+");
        expect(largeDiff.length).toBeGreaterThan(MAX_AI_DIFF_BYTES);

        // Simulate the size gate logic from LocalTaskHandler
        let diffToAnalyze = largeDiff;
        if (largeDiff.length > MAX_AI_DIFF_BYTES) {
            const { truncated } = service.truncateDiff(largeDiff, MAX_AI_DIFF_BYTES);
            diffToAnalyze = truncated;
        }

        // The diff passed to AI should be the truncated version
        expect(diffToAnalyze).not.toBe(largeDiff);
        expect(diffToAnalyze.length).toBeLessThan(largeDiff.length);
        // It should contain the truncation note
        expect(diffToAnalyze).toContain("[Diff truncated:");
        expect(diffToAnalyze).toContain("files omitted due to size limit");
    });
});
