namespace SeedOauthClientCredentialsMandatoryAuth.Core;

/// <summary>
/// Marks a property as optional in the OpenAPI specification.
/// Optional properties use the <c>Optional&lt;T&gt;</c> type and can be undefined (not present in JSON).
/// </summary>
/// <remarks>
/// Properties marked with [Optional] should use the <c>Optional&lt;T&gt;</c> type:
/// - Undefined: <c>Optional&lt;T&gt;.Undefined</c> → omitted from JSON
/// - Defined: <c>Optional&lt;T&gt;.Of(value)</c> → written to JSON
///
/// Combine with [Nullable] to allow null values:
/// - [Optional, Nullable] <c>Optional&lt;string?&gt;</c> → can be undefined, null, or a value
/// - [Optional] <c>Optional&lt;string&gt;</c> → can be undefined or a value (null is invalid)
/// </remarks>
[global::System.AttributeUsage(global::System.AttributeTargets.Property, AllowMultiple = false)]
public class OptionalAttribute : global::System.Attribute { }
