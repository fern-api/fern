namespace SeedCsharpOauthTokenOptional.Core;

/// <summary>
/// Marks a property as nullable in the OpenAPI specification.
/// When applied to <c>Optional&lt;T&gt;</c> properties, this indicates that null values should be
/// written to JSON when the optional is defined with null.
/// </summary>
/// <remarks>
/// For regular (required) properties:
/// - Without [Nullable]: null values are invalid (omit from JSON at runtime)
/// - With [Nullable]: null values are written to JSON
///
/// For <c>Optional&lt;T&gt;</c> properties (also marked with [Optional]):
/// - Without [Nullable]: <c>Optional&lt;T&gt;.Of(null)</c> → omit from JSON (runtime edge case)
/// - With [Nullable]: <c>Optional&lt;T?&gt;.Of(null)</c> → write null to JSON
/// </remarks>
[global::System.AttributeUsage(global::System.AttributeTargets.Property, AllowMultiple = false)]
public class NullableAttribute : global::System.Attribute { }
