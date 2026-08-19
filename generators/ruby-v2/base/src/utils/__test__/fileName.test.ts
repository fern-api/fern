import { buildRubyTypeFileName, MAX_RUBY_FILE_NAME_LENGTH } from "../fileName.js";

describe("buildRubyTypeFileName", () => {
    test("returns the name verbatim when it fits within the limit", () => {
        expect(buildRubyTypeFileName("user")).toBe("user.rb");
        expect(buildRubyTypeFileName("event_stream_cloud_event_connection_updated")).toBe(
            "event_stream_cloud_event_connection_updated.rb"
        );
    });

    test("leaves a name that is exactly at the limit unchanged", () => {
        // 97 chars + ".rb" = 100, the maximum allowed.
        const snakeName = "a".repeat(MAX_RUBY_FILE_NAME_LENGTH - ".rb".length);
        const result = buildRubyTypeFileName(snakeName);
        expect(result).toBe(`${snakeName}.rb`);
        expect(result.length).toBe(MAX_RUBY_FILE_NAME_LENGTH);
    });

    test("truncates and hashes names that exceed the limit", () => {
        const snakeName =
            "event_stream_cloud_event_connection_updated_object3options_assertion_decryption_settings_algorithm_profile_enum";
        expect(snakeName.length + ".rb".length).toBeGreaterThan(MAX_RUBY_FILE_NAME_LENGTH);

        const result = buildRubyTypeFileName(snakeName);
        expect(result.length).toBeLessThanOrEqual(MAX_RUBY_FILE_NAME_LENGTH);
        expect(result.endsWith(".rb")).toBe(true);
        expect(result.startsWith("event_stream_cloud_event_connection_updated")).toBe(true);
    });

    test("is deterministic for the same input", () => {
        const snakeName = "x".repeat(200);
        expect(buildRubyTypeFileName(snakeName)).toBe(buildRubyTypeFileName(snakeName));
    });

    test("produces distinct filenames for distinct names sharing a truncated prefix", () => {
        const prefix = "shared_prefix_".repeat(10); // long common prefix well past the cap
        const first = buildRubyTypeFileName(`${prefix}_alpha_variant`);
        const second = buildRubyTypeFileName(`${prefix}_beta_variant`);
        expect(first).not.toBe(second);
        expect(first.length).toBeLessThanOrEqual(MAX_RUBY_FILE_NAME_LENGTH);
        expect(second.length).toBeLessThanOrEqual(MAX_RUBY_FILE_NAME_LENGTH);
    });

    test("does not leave a trailing underscore before the hash separator", () => {
        // Construct a name whose truncation boundary lands on an underscore.
        const snakeName = "word_".repeat(40);
        const result = buildRubyTypeFileName(snakeName);
        expect(result).not.toContain("__");
        expect(result.length).toBeLessThanOrEqual(MAX_RUBY_FILE_NAME_LENGTH);
    });
});
