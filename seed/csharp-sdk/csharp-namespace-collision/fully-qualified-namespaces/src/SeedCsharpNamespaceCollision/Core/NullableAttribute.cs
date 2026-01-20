namespace SeedCsharpNamespaceCollision.Core;

/// <summary>
/// Marks a property as nullable in the OpenAPI specification.
/// When applied to Optional<T> properties, this indicates that null values should be
/// written to JSON when the optional is defined with null.
/// </summary>
/// <remarks>
/// For regular (required) properties:
/// - Without [Nullable]: null values are invalid (omit from JSON at runtime)
/// - With [Nullable]: null values are written to JSON
///
/// For Optional<T> properties (also marked with [Optional]):
/// - Without [Nullable]: Optional<T>.Of(null) → omit from JSON (runtime edge case)
/// - With [Nullable]: Optional<T?>.Of(null) → write null to JSON
/// </remarks>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class NullableAttribute : Attribute { }
