import { rust } from "../../..";

describe("DocComment", () => {
    describe("write", () => {
        it("should write basic doc comment with summary only", async () => {
            const docComment = rust.docComment({
                summary: "This is a basic function"
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/basic_summary.rs");
        });

        it("should write doc comment with summary and description", async () => {
            const docComment = rust.docComment({
                summary: "Processes user data",
                description: "This function takes user input and processes it according to the business rules."
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/summary_and_description.rs");
        });

        it("should write doc comment with parameters", async () => {
            const docComment = rust.docComment({
                summary: "Creates a new user account",
                parameters: [
                    { name: "username", description: "The desired username for the account" },
                    { name: "email", description: "User's email address" },
                    { name: "is_active", description: "Whether the account should be active initially" }
                ]
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/with_parameters.rs");
        });

        it("should write doc comment with returns", async () => {
            const docComment = rust.docComment({
                summary: "Calculates the total price",
                returns: "The total price including tax and fees"
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/with_returns.rs");
        });

        it("should write doc comment with errors", async () => {
            const docComment = rust.docComment({
                summary: "Validates user input",
                errors: [
                    "Returns `ValidationError` if the input is invalid",
                    "Returns `NetworkError` if the validation service is unavailable"
                ]
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/with_errors.rs");
        });

        it("should write doc comment with examples", async () => {
            const docComment = rust.docComment({
                summary: "Concatenates two strings",
                examples: ['let result = concat_strings("hello", "world");\nassert_eq!(result, "helloworld");']
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/with_examples.rs");
        });

        it("should write complete doc comment with all sections", async () => {
            const docComment = rust.docComment({
                summary: "Authenticates a user with the service",
                description:
                    "This method validates user credentials against the authentication service and returns a token if successful.",
                parameters: [
                    { name: "username", description: "The user's login name" },
                    { name: "password", description: "The user's password" },
                    { name: "options", description: "Additional authentication options" }
                ],
                returns: "Authentication token if successful",
                errors: [
                    "Returns `AuthError` if credentials are invalid",
                    "Returns `NetworkError` if unable to reach the service",
                    "Returns `TimeoutError` if the request times out"
                ],
                examples: [
                    'let client = AuthClient::new();\nlet token = client.authenticate("user", "pass", None).await?;'
                ]
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/complete_doc_comment.rs");
        });

        describe("multiline handling", () => {
            it("should handle multiline summary", async () => {
                const docComment = rust.docComment({
                    summary:
                        "This is a very long summary that spans\nmultiple lines to test proper\nhandling of line breaks"
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_summary.rs");
            });

            it("should handle multiline description", async () => {
                const docComment = rust.docComment({
                    summary: "Process data",
                    description:
                        "This function processes data in multiple steps:\n\n1. Validates the input\n2. Transforms the data\n3. Returns the result"
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_description.rs");
            });

            it("should handle multiline parameters", async () => {
                const docComment = rust.docComment({
                    summary: "Get device information",
                    parameters: [
                        {
                            name: "name_or_id",
                            description:
                                "Device name or ID. Device names must be URI-encoded if they contain\nnon-URI-safe characters. If a device is named with another device's ID,\nthe device with the matching name will be returned."
                        },
                        {
                            name: "tolerance",
                            description:
                                "Minimum interval (in seconds) that ranges must be separated by to be considered discrete.\nCurrently, the minimum meaningful value is 14s and smaller values will be clamped to this value."
                        }
                    ]
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_parameters.rs");
            });

            it("should handle multiline returns", async () => {
                const docComment = rust.docComment({
                    summary: "Query data",
                    returns:
                        "A Result containing the queried data on success.\nReturns an empty Vec if no data matches the query criteria.\nThe data is sorted by timestamp in ascending order."
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_returns.rs");
            });

            it("should handle multiline errors", async () => {
                const docComment = rust.docComment({
                    summary: "Connect to database",
                    errors: [
                        "Returns `DatabaseError` if connection fails\ndue to network issues or invalid credentials",
                        "Returns `TimeoutError` if the connection\nattempt exceeds the configured timeout"
                    ]
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_errors.rs");
            });
        });

        describe("text sanitization", () => {
            it("should sanitize null bytes", async () => {
                const docComment = rust.docComment({
                    summary: "Function with null\x00bytes in description",
                    description: "This has\x00null\x00bytes that should be removed"
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/sanitized_null_bytes.rs");
            });

            it("should sanitize carriage returns", async () => {
                const docComment = rust.docComment({
                    summary: "Function with\r\ncarriage returns",
                    description: "This has\rcarriage\r\nreturns that should be normalized"
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/sanitized_carriage_returns.rs");
            });

            it("should handle special characters", async () => {
                const docComment = rust.docComment({
                    summary: "Function with special chars: @#$%^&*(){}[]|\\:;\"'<>,.?/",
                    description: "Tests various special characters that might break formatting"
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/special_characters.rs");
            });

            it("should handle backticks and code formatting", async () => {
                const docComment = rust.docComment({
                    summary: "Use `cargo build` to compile",
                    description: "This function uses `serde` for serialization and `tokio` for async operations",
                    parameters: [{ name: "config", description: "Configuration with `debug` and `release` modes" }]
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/code_formatting.rs");
            });
        });

        describe("edge cases", () => {
            it("should handle empty lines in multiline text", async () => {
                const docComment = rust.docComment({
                    summary: "Function with empty lines",
                    description: "First paragraph.\n\nSecond paragraph after empty line.\n\nThird paragraph."
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/empty_lines.rs");
            });

            it("should handle very long lines", async () => {
                const docComment = rust.docComment({
                    summary:
                        "This is a very long line of documentation that should be wrapped properly to ensure it doesn't cause any syntax errors in the generated Rust code when the line exceeds reasonable length limits and needs to be broken into multiple comment lines for better readability"
                });

                await expect(docComment.toString()).toMatchFileSnapshot("snapshots/long_lines.rs");
            });
        });
    });
});
