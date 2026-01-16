using System;

namespace SeedOauthClientCredentials;

/// <summary>
/// Represents an HTTP header with a name and value.
/// </summary>
public readonly struct HttpHeader : IEquatable<HttpHeader>
{
    /// <summary>
    /// Creates a new instance of <see cref="HttpHeader"/> with the provided name and value.
    /// </summary>
    /// <param name="name">The header name.</param>
    /// <param name="value">The header value.</param>
    public HttpHeader(string name, string value)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("Header name cannot be null or empty", nameof(name));
        }

        Name = name;
        Value = value;
    }

    /// <summary>
    /// Gets the header name.
    /// </summary>
    public string Name { get; }

    /// <summary>
    /// Gets the header value. If the header has multiple values, they are joined with a comma.
    /// To get separate values, use <see cref="ResponseHeaders.TryGetValues"/>.
    /// </summary>
    public string Value { get; }

    /// <inheritdoc/>
    public override int GetHashCode()
    {
        return HashCode.Combine(
            StringComparer.OrdinalIgnoreCase.GetHashCode(Name ?? string.Empty),
            Value?.GetHashCode() ?? 0
        );
    }

    /// <inheritdoc/>
    public override bool Equals(object? obj)
    {
        return obj is HttpHeader header && Equals(header);
    }

    /// <inheritdoc/>
    public bool Equals(HttpHeader other)
    {
        return string.Equals(Name, other.Name, StringComparison.OrdinalIgnoreCase)
            && string.Equals(Value, other.Value, StringComparison.Ordinal);
    }

    /// <inheritdoc/>
    public override string ToString() => $"{Name}: {Value}";

    /// <summary>
    /// Determines whether two <see cref="HttpHeader"/> instances are equal.
    /// </summary>
    public static bool operator ==(HttpHeader left, HttpHeader right) => left.Equals(right);

    /// <summary>
    /// Determines whether two <see cref="HttpHeader"/> instances are not equal.
    /// </summary>
    public static bool operator !=(HttpHeader left, HttpHeader right) => !left.Equals(right);

    /// <summary>
    /// Contains names of commonly used HTTP headers.
    /// </summary>
    public static class Names
    {
        /// <summary>Returns "Content-Type".</summary>
        public const string ContentType = "Content-Type";

        /// <summary>Returns "Content-Length".</summary>
        public const string ContentLength = "Content-Length";

        /// <summary>Returns "ETag".</summary>
        public const string ETag = "ETag";

        /// <summary>Returns "Date".</summary>
        public const string Date = "Date";

        /// <summary>Returns "X-Request-Id".</summary>
        public const string XRequestId = "X-Request-Id";

        /// <summary>Returns "Authorization".</summary>
        public const string Authorization = "Authorization";

        /// <summary>Returns "Accept".</summary>
        public const string Accept = "Accept";

        /// <summary>Returns "User-Agent".</summary>
        public const string UserAgent = "User-Agent";

        /// <summary>Returns "Cache-Control".</summary>
        public const string CacheControl = "Cache-Control";

        /// <summary>Returns "Location".</summary>
        public const string Location = "Location";

        /// <summary>Returns "Retry-After".</summary>
        public const string RetryAfter = "Retry-After";
    }
}
