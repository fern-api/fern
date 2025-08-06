import { swift } from "../../..";

describe("DocComment", () => {
    describe("write", () => {
        it("should write basic doc comment with summary only", async () => {
            const docComment = swift.docComment({
                summary: "This is a basic function"
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/basic_summary.swift");
        });

        it("should write doc comment with summary and description", async () => {
            const docComment = swift.docComment({
                summary: "Processes user data",
                description: "This function takes user input and processes it according to the business rules."
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/summary_and_description.swift");
        });

        it("should write doc comment with parameters", async () => {
            const docComment = swift.docComment({
                summary: "Creates a new user account",
                parameters: [
                    { name: "username", description: "The desired username for the account" },
                    { name: "email", description: "User's email address" },
                    { name: "isActive", description: "Whether the account should be active initially" }
                ]
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/with_parameters.swift");
        });

        it("should write doc comment with returns", async () => {
            const docComment = swift.docComment({
                summary: "Calculates the total price",
                returns: "The total price including tax and fees"
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/with_returns.swift");
        });

        it("should write doc comment with throws", async () => {
            const docComment = swift.docComment({
                summary: "Validates user input",
                throws: [
                    "ValidationError if the input is invalid",
                    "NetworkError if the validation service is unavailable"
                ]
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/with_throws.swift");
        });

        it("should write complete doc comment with all fields", async () => {
            const docComment = swift.docComment({
                summary: "Authenticates a user with the service",
                description:
                    "This method attempts to authenticate a user using their credentials. It will check both local cache and remote service if necessary.",
                parameters: [
                    { name: "username", description: "The user's login name" },
                    { name: "password", description: "The user's password" },
                    { name: "rememberMe", description: "Whether to store credentials for future use" }
                ],
                returns: "An authentication token if successful",
                throws: [
                    "AuthenticationError if credentials are invalid",
                    "NetworkError if unable to reach the service"
                ]
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/complete_doc_comment.swift");
        });

        it("should handle multi-line summary", async () => {
            const docComment = swift.docComment({
                summary:
                    "This is a very long summary that might span multiple lines when formatted properly in the source code"
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_summary.swift");
        });

        it("should handle multi-line description", async () => {
            const docComment = swift.docComment({
                summary: "Complex data processor",
                description:
                    "This function performs complex data processing operations.\nIt handles multiple data types and formats.\nThe processing includes validation, transformation, and storage."
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_description.swift");
        });

        it("should handle multi-line parameter descriptions", async () => {
            const docComment = swift.docComment({
                summary: "Configures the application settings",
                parameters: [
                    {
                        name: "config",
                        description:
                            "The configuration object containing all necessary settings.\nThis includes database connections, API keys, and feature flags."
                    },
                    {
                        name: "environment",
                        description:
                            "The target environment (development, staging, production).\nThis affects which configuration values are used."
                    }
                ]
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_parameters.swift");
        });

        it("should handle multi-line returns description", async () => {
            const docComment = swift.docComment({
                summary: "Generates a comprehensive report",
                returns:
                    "A detailed report object containing:\n- User statistics\n- Performance metrics\n- Error logs and diagnostics"
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_returns.swift");
        });

        it("should handle multi-line throws descriptions", async () => {
            const docComment = swift.docComment({
                summary: "Performs critical system operation",
                throws: [
                    "SystemError if the operation fails due to:\n- Insufficient permissions\n- Resource unavailability",
                    "ValidationError if input parameters are invalid:\n- Missing required fields\n- Invalid data formats"
                ]
            });

            await expect(docComment.toString()).toMatchFileSnapshot("snapshots/multiline_throws.swift");
        });
    });
});
