namespace <%= namespace%>;

/// <summary>
/// Marks a property as optional in the OpenAPI specification.
/// Optional properties use the Optional<T> type and can be undefined (not present in JSON).
/// </summary>
/// <remarks>
/// Properties marked with [Optional] should use the Optional<T> type:
/// - Undefined: Optional<T>.Undefined → omitted from JSON
/// - Defined: Optional<T>.Of(value) → written to JSON
///
/// Combine with [Nullable] to allow null values:
/// - [Optional, Nullable] Optional<string?> → can be undefined, null, or a value
/// - [Optional] Optional<string> → can be undefined or a value (null is invalid)
/// </remarks>
[global::System.AttributeUsage(global::System.AttributeTargets.Property, AllowMultiple = false)]
public class OptionalAttribute : global::System.Attribute
{
}
