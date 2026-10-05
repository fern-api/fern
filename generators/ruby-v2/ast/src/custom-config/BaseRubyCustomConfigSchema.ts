import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema.js";

export const BaseRubyCustomConfigSchema = z.object({
    // The Ruby module name used for folder structure and module naming (e.g., "Square" -> lib/square/, module Square)
    moduleName: z.optional(z.string()),
    clientModuleName: z.optional(z.string()),
    customReadmeSections: z.optional(z.array(CustomReadmeSectionSchema)),
    customPagerName: z.optional(z.string()),
    offsetSemantics: z.enum(["item-index", "page-index"]).optional(),
    // Generate wire tests for serialization/deserialization
    enableWireTests: z.boolean().optional(),
    // Extra dependencies to add to the gemspec (e.g., { "my-gem": "~> 6.0" })
    extraDependencies: z.optional(
        z.record(
            z.string().regex(/^[^"\r\n\\]+$/, "Must not contain quotes, backslashes, or newlines"),
            z.string().regex(/^[^"\r\n\\]+$/, "Must not contain quotes, backslashes, or newlines")
        )
    ),
    // Extra dev dependencies to add to the Gemfile (e.g., { "my-gem": "~> 6.0" })
    extraDevDependencies: z.optional(
        z.record(
            z.string().regex(/^[^"\r\n\\]+$/, "Must not contain quotes, backslashes, or newlines"),
            z.string().regex(/^[^"\r\n\\]+$/, "Must not contain quotes, backslashes, or newlines")
        )
    ),
    // Paths to files that will be auto-loaded when the gem is required
    // (e.g., ["custom_integration", "sentry_integration"] will load lib/<gem>/custom_integration.rb
    // and lib/<gem>/sentry_integration.rb if they exist)
    requirePaths: z.optional(
        z.array(z.string().regex(/^[^"\r\n\\]+$/, "Must not contain quotes, backslashes, or newlines"))
    ),
    // Apply IR-defined default values to query parameters and headers in request wrappers
    useDefaultRequestParameterValues: z.boolean().optional(),
    omitFernHeaders: z.boolean().optional(),
    // Opt-in: emit the X-Fern-Runtime, X-Fern-Runtime-Version, and X-Fern-Platform
    // observability headers. Disabled by default so existing output is unchanged.
    includePlatformHeaders: z.boolean().optional(),
    // Opt-in: expose an optional `app_info` client keyword whose product token is
    // appended to the User-Agent header (RFC 9110). Disabled by default so existing
    // output is byte-identical.
    allowUserAgentAppInfo: z.boolean().optional(),
    // RuboCop Naming/VariableNumber style for field names with numbers
    // - "snake_case": requires underscores before numbers (e.g., recaptcha_v_2) - default
    // - "normalcase": allows numbers without underscores (e.g., recaptcha_v2, office365)
    // - "disabled": disables the cop entirely
    rubocopVariableNumberStyle: z.enum(["snake_case", "normalcase", "disabled"]).optional(),
    // Severity level for the Naming/VariableNumber cop
    // - "info": reports violations as informational notes
    // - "warning": reports violations as warnings (default for customer SDKs)
    // - "error": reports violations as errors (used in seed to enforce rubocop)
    rubocopSeverity: z.enum(["info", "warning", "error"]).optional(),
    maxRetries: z.number().int().min(0).optional(),
    // Opt-in: when the API composes OAuth client-credentials with basic auth
    // (`auth: any`), auth credentials passed explicitly to the client constructor
    // take precedence over environment-variable defaults when selecting the auth
    // scheme. Disabled by default so existing output is unchanged (OAuth env vars
    // win over explicitly provided basic auth).
    preferExplicitAuth: z.boolean().optional(),
    retryStatusCodes: z.optional(z.enum(["legacy", "recommended"])),
    // Opt-in: when the IR marks a referenced request body as optional, a caller that
    // passes no body properties sends neither a body nor a Content-Type header.
    // Disabled by default so existing output is byte-identical.
    respectOptionalRequestBody: z.boolean().optional(),
    // Opt-in: credential keywords on the client follow the names configured on the auth
    // schemes (`token: { name: apiKey }` exposes `api_key:`). Disabled by default, since
    // renaming a keyword breaks callers of an already published gem.
    respectAuthSchemeNames: z.boolean().optional(),
    // Opt-in: the undiscriminated-union matcher treats a required field that is also
    // `nullable` as satisfied when it arrives as `nil`. Without this, such a field looks
    // like a missing required field, no member matches, and the union falls back to an
    // untyped Hash instead of the documented model. Disabled by default because callers
    // of a published gem may already read that Hash by key.
    respectNullableUnionFields: z.boolean().optional(),
    // Opt-in: a type alias to a named type coerces into that type rather than returning
    // the result of a bare `JSON.parse`. Without this, an endpoint whose response schema
    // is a `$ref` to another schema returns a string-keyed Hash while the SDK documents
    // the aliased model. Disabled by default because callers of a published gem may
    // already read that Hash by key.
    coerceAliasResponses: z.boolean().optional()
});

export type BaseRubyCustomConfigSchema = z.infer<typeof BaseRubyCustomConfigSchema>;
