using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedLiteralsUnions.Core;

/// <summary>
/// Non-generic interface for Optional types to enable reflection-free checks.
/// </summary>
public interface IOptional
{
    /// <summary>
    /// Returns true if the value is defined (set), even if the value is null.
    /// </summary>
    bool IsDefined { get; }

    /// <summary>
    /// Gets the boxed value. Returns null if undefined or if the value is null.
    /// </summary>
    object? GetBoxedValue();
}

/// <summary>
/// Represents a field that can be "not set" (undefined) vs "explicitly set" (defined).
/// Use this for HTTP PATCH requests where you need to distinguish between:
/// <list type="bullet">
/// <item><description>Undefined: Don't send this field (leave it unchanged on the server)</description></item>
/// <item><description>Defined with null: Send null (clear the field on the server)</description></item>
/// <item><description>Defined with value: Send the value (update the field on the server)</description></item>
/// </list>
/// </summary>
/// <typeparam name="T">The type of the value. Use nullable types (T?) for fields that can be null.</typeparam>
/// <example>
/// For nullable string fields, use <c>Optional&lt;string?&gt;</c>:
/// <code>
/// public class UpdateUserRequest
/// {
///     public Optional&lt;string?&gt; Name { get; set; } = Optional&lt;string?&gt;.Undefined;
/// }
///
/// var request = new UpdateUserRequest
/// {
///     Name = "John"  // Will send: { "name": "John" }
/// };
///
/// var request2 = new UpdateUserRequest
/// {
///     Name = Optional&lt;string?&gt;.Of(null)  // Will send: { "name": null }
/// };
///
/// var request3 = new UpdateUserRequest();  // Will send: {} (name not included)
/// </code>
/// </example>
public readonly struct Optional<T> : IOptional, IEquatable<Optional<T>>
{
    private readonly T _value;
    private readonly bool _isDefined;

    private Optional(T value, bool isDefined)
    {
        _value = value;
        _isDefined = isDefined;
    }

    /// <summary>
    /// Creates an undefined value - the field will not be included in the HTTP request.
    /// Use this as the default value for optional fields.
    /// </summary>
    /// <example>
    /// <code>
    /// public Optional&lt;string?&gt; Email { get; set; } = Optional&lt;string?&gt;.Undefined;
    /// </code>
    /// </example>
    public static Optional<T> Undefined => new(default!, false);

    /// <summary>
    /// Creates a defined value - the field will be included in the HTTP request.
    /// The value can be null if T is a nullable type.
    /// </summary>
    /// <param name="value">The value to set. Can be null if T is nullable (e.g., string?, int?).</param>
    /// <example>
    /// <code>
    /// // Set to a value
    /// request.Name = Optional&lt;string?&gt;.Of("John");
    ///
    /// // Set to null (clears the field)
    /// request.Email = Optional&lt;string?&gt;.Of(null);
    ///
    /// // Or use implicit conversion
    /// request.Name = "John";  // Same as Of("John")
    /// request.Email = null;   // Same as Of(null)
    /// </code>
    /// </example>
    public static Optional<T> Of(T value) => new(value, true);

    /// <summary>
    /// Returns true if the field is defined (set), even if the value is null.
    /// Use this to determine if the field should be included in the HTTP request.
    /// </summary>
    /// <example>
    /// <code>
    /// if (request.Name.IsDefined)
    /// {
    ///     requestBody["name"] = request.Name.Value;  // Include in request (can be null)
    /// }
    /// </code>
    /// </example>
    public bool IsDefined => _isDefined;

    /// <summary>
    /// Returns true if the field is undefined (not set).
    /// Use this to check if the field should be excluded from the HTTP request.
    /// </summary>
    /// <example>
    /// <code>
    /// if (request.Email.IsUndefined)
    /// {
    ///     // Don't include email in the request - leave it unchanged
    /// }
    /// </code>
    /// </example>
    public bool IsUndefined => !_isDefined;

    /// <summary>
    /// Gets the value. The value may be null if T is a nullable type.
    /// </summary>
    /// <exception cref="InvalidOperationException">Thrown if the value is undefined.</exception>
    /// <remarks>
    /// Always check <see cref="IsDefined"/> before accessing Value, or use <see cref="TryGetValue"/> instead.
    /// </remarks>
    /// <example>
    /// <code>
    /// if (request.Name.IsDefined)
    /// {
    ///     string? name = request.Name.Value;  // Safe - can be null if Optional&lt;string?&gt;
    /// }
    ///
    /// // Or check for null explicitly
    /// if (request.Email.IsDefined &amp;&amp; request.Email.Value is null)
    /// {
    ///     // Email is explicitly set to null (clear it)
    /// }
    /// </code>
    /// </example>
    public T Value
    {
        get
        {
            if (!_isDefined)
                throw new InvalidOperationException("Optional value is undefined");
            return _value;
        }
    }

    /// <summary>
    /// Gets the value if defined, otherwise returns the specified default value.
    /// Note: If the value is defined as null, this returns null (not the default).
    /// </summary>
    /// <param name="defaultValue">The value to return if undefined.</param>
    /// <returns>The actual value if defined (can be null), otherwise the default value.</returns>
    /// <example>
    /// <code>
    /// string name = request.Name.GetValueOrDefault("Anonymous");
    /// // If Name is undefined: returns "Anonymous"
    /// // If Name is Of(null): returns null
    /// // If Name is Of("John"): returns "John"
    /// </code>
    /// </example>
    public T GetValueOrDefault(T defaultValue = default!)
    {
        return _isDefined ? _value : defaultValue;
    }

    /// <summary>
    /// Tries to get the value. Returns true if the value is defined (even if null).
    /// </summary>
    /// <param name="value">
    /// When this method returns, contains the value if defined, or default(T) if undefined.
    /// The value may be null if T is nullable.
    /// </param>
    /// <returns>True if the value is defined; otherwise, false.</returns>
    /// <example>
    /// <code>
    /// if (request.Email.TryGetValue(out var email))
    /// {
    ///     requestBody["email"] = email;  // email can be null
    /// }
    /// else
    /// {
    ///     // Email is undefined - don't include in request
    /// }
    /// </code>
    /// </example>
    public bool TryGetValue(out T value)
    {
        if (_isDefined)
        {
            value = _value;
            return true;
        }
        value = default!;
        return false;
    }

    /// <summary>
    /// Implicitly converts a value to Optional&lt;T&gt;.Of(value).
    /// This allows natural assignment: <c>request.Name = "John"</c> instead of <c>request.Name = Optional&lt;string?&gt;.Of("John")</c>.
    /// </summary>
    /// <param name="value">The value to convert (can be null if T is nullable).</param>
    public static implicit operator Optional<T>(T value) => Of(value);

    /// <summary>
    /// Returns a string representation of this Optional value.
    /// </summary>
    /// <returns>"Undefined" if not set, or "Defined(value)" if set.</returns>
    public override string ToString() => _isDefined ? $"Defined({_value})" : "Undefined";

    /// <summary>
    /// Gets the boxed value. Returns null if undefined or if the value is null.
    /// </summary>
    public object? GetBoxedValue()
    {
        if (!_isDefined)
            return null;
        return _value;
    }

    /// <inheritdoc/>
    public bool Equals(Optional<T> other) =>
        _isDefined == other._isDefined && EqualityComparer<T>.Default.Equals(_value, other._value);

    /// <inheritdoc/>
    public override bool Equals(object? obj) => obj is Optional<T> other && Equals(other);

    /// <inheritdoc/>
    public override int GetHashCode()
    {
        if (!_isDefined)
            return 0;
        unchecked
        {
            int hash = 17;
            hash = hash * 31 + 1; // _isDefined = true
            hash = hash * 31 + (_value is null ? 0 : _value.GetHashCode());
            return hash;
        }
    }

    /// <summary>
    /// Determines whether two Optional values are equal.
    /// </summary>
    /// <param name="left">The first Optional to compare.</param>
    /// <param name="right">The second Optional to compare.</param>
    /// <returns>True if the Optional values are equal; otherwise, false.</returns>
    public static bool operator ==(Optional<T> left, Optional<T> right) => left.Equals(right);

    /// <summary>
    /// Determines whether two Optional values are not equal.
    /// </summary>
    /// <param name="left">The first Optional to compare.</param>
    /// <param name="right">The second Optional to compare.</param>
    /// <returns>True if the Optional values are not equal; otherwise, false.</returns>
    public static bool operator !=(Optional<T> left, Optional<T> right) => !left.Equals(right);
}

/// <summary>
/// Extension methods for Optional<T> to simplify common operations.
/// </summary>
public static class OptionalExtensions
{
    /// <summary>
    /// Adds the value to a dictionary if the optional is defined (even if the value is null).
    /// This is useful for building JSON request payloads where null values should be included.
    /// </summary>
    /// <typeparam name="T">The type of the optional value.</typeparam>
    /// <param name="optional">The optional value to add.</param>
    /// <param name="dictionary">The dictionary to add to.</param>
    /// <param name="key">The key to use in the dictionary.</param>
    /// <example>
    /// <code>
    /// var dict = new Dictionary&lt;string, object?&gt;();
    /// request.Name.AddTo(dict, "name");      // Adds only if Name.IsDefined
    /// request.Email.AddTo(dict, "email");    // Adds only if Email.IsDefined
    /// </code>
    /// </example>
    public static void AddTo<T>(
        this Optional<T> optional,
        Dictionary<string, object?> dictionary,
        string key
    )
    {
        if (optional.IsDefined)
        {
            dictionary[key] = optional.Value;
        }
    }

    /// <summary>
    /// Executes an action if the optional is defined.
    /// </summary>
    /// <typeparam name="T">The type of the optional value.</typeparam>
    /// <param name="optional">The optional value.</param>
    /// <param name="action">The action to execute with the value.</param>
    /// <example>
    /// <code>
    /// request.Name.IfDefined(name => Console.WriteLine($"Name: {name}"));
    /// </code>
    /// </example>
    public static void IfDefined<T>(this Optional<T> optional, Action<T> action)
    {
        if (optional.IsDefined)
        {
            action(optional.Value);
        }
    }

    /// <summary>
    /// Maps the value to a new type if the optional is defined, otherwise returns undefined.
    /// </summary>
    /// <typeparam name="T">The type of the original value.</typeparam>
    /// <typeparam name="TResult">The type to map to.</typeparam>
    /// <param name="optional">The optional value to map.</param>
    /// <param name="mapper">The mapping function.</param>
    /// <returns>An optional containing the mapped value if defined, otherwise undefined.</returns>
    /// <example>
    /// <code>
    /// Optional&lt;string?&gt; name = Optional&lt;string?&gt;.Of("John");
    /// Optional&lt;int&gt; length = name.Map(n => n?.Length ?? 0);  // Optional.Of(4)
    /// </code>
    /// </example>
    public static Optional<TResult> Map<T, TResult>(
        this Optional<T> optional,
        Func<T, TResult> mapper
    )
    {
        return optional.IsDefined
            ? Optional<TResult>.Of(mapper(optional.Value))
            : Optional<TResult>.Undefined;
    }

    /// <summary>
    /// Adds a nullable value to a dictionary only if it is not null.
    /// This is useful for regular nullable properties where null means "omit from request".
    /// </summary>
    /// <typeparam name="T">The type of the value (must be a reference type or Nullable<T>).</typeparam>
    /// <param name="value">The nullable value to add.</param>
    /// <param name="dictionary">The dictionary to add to.</param>
    /// <param name="key">The key to use in the dictionary.</param>
    /// <example>
    /// <code>
    /// var dict = new Dictionary&lt;string, object?&gt;();
    /// request.Description.AddIfNotNull(dict, "description");  // Only adds if not null
    /// request.Score.AddIfNotNull(dict, "score");              // Only adds if not null
    /// </code>
    /// </example>
    public static void AddIfNotNull<T>(
        this T? value,
        Dictionary<string, object?> dictionary,
        string key
    )
        where T : class
    {
        if (value is not null)
        {
            dictionary[key] = value;
        }
    }

    /// <summary>
    /// Adds a nullable value type to a dictionary only if it has a value.
    /// This is useful for regular nullable properties where null means "omit from request".
    /// </summary>
    /// <typeparam name="T">The underlying value type.</typeparam>
    /// <param name="value">The nullable value to add.</param>
    /// <param name="dictionary">The dictionary to add to.</param>
    /// <param name="key">The key to use in the dictionary.</param>
    /// <example>
    /// <code>
    /// var dict = new Dictionary&lt;string, object?&gt;();
    /// request.Age.AddIfNotNull(dict, "age");    // Only adds if HasValue
    /// request.Score.AddIfNotNull(dict, "score"); // Only adds if HasValue
    /// </code>
    /// </example>
    public static void AddIfNotNull<T>(
        this T? value,
        Dictionary<string, object?> dictionary,
        string key
    )
        where T : struct
    {
        if (value.HasValue)
        {
            dictionary[key] = value.Value;
        }
    }
}

/// <summary>
/// JSON converter factory for Optional<T> that handles undefined vs null correctly.
/// Uses a TypeInfoResolver to conditionally include/exclude properties based on Optional.IsDefined.
/// </summary>
public class OptionalJsonConverterFactory : JsonConverterFactory
{
    public override bool CanConvert(global::System.Type typeToConvert)
    {
        if (!typeToConvert.IsGenericType)
            return false;

        return typeToConvert.GetGenericTypeDefinition() == typeof(Optional<>);
    }

    public override JsonConverter? CreateConverter(
        global::System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        var valueType = typeToConvert.GetGenericArguments()[0];
        var converterType = typeof(OptionalJsonConverter<>).MakeGenericType(valueType);
        return (JsonConverter?)global::System.Activator.CreateInstance(converterType);
    }
}

/// <summary>
/// JSON converter for Optional<T> that unwraps the value during serialization.
/// The actual property skipping is handled by the OptionalTypeInfoResolver.
/// </summary>
public class OptionalJsonConverter<T> : JsonConverter<Optional<T>>
{
    public override Optional<T> Read(
        ref Utf8JsonReader reader,
        global::System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return Optional<T>.Of(default!);
        }

        var value = JsonSerializer.Deserialize<T>(ref reader, options);
        return Optional<T>.Of(value!);
    }

    public override void Write(
        Utf8JsonWriter writer,
        Optional<T> value,
        JsonSerializerOptions options
    )
    {
        // This will be called by the serializer
        // We need to unwrap and serialize the inner value
        // The TypeInfoResolver will handle skipping undefined values

        if (value.IsUndefined)
        {
            // This shouldn't be called for undefined values due to ShouldSerialize
            // But if it is, write null and let the resolver filter it
            writer.WriteNullValue();
            return;
        }

        // Get the inner value
        var innerValue = value.Value;

        // Write null directly if the value is null (don't use JsonSerializer.Serialize for null)
        if (innerValue == null)
        {
            writer.WriteNullValue();
            return;
        }

        // Serialize the unwrapped value
        JsonSerializer.Serialize(writer, innerValue, options);
    }
}
