using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Linq;

namespace SeedExtends;

/// <summary>
/// Represents HTTP response headers with typed access to common header values.
/// </summary>
public readonly struct ResponseHeaders : IEnumerable<HttpHeader>
{
    private readonly IReadOnlyDictionary<string, IEnumerable<string>> _headers;

    /// <summary>
    /// Creates a new instance of <see cref="ResponseHeaders"/> with the provided headers.
    /// </summary>
    /// <param name="headers">The underlying header storage.</param>
    public ResponseHeaders(IEnumerable<KeyValuePair<string, IEnumerable<string>>> headers)
    {
        _headers = new Dictionary<string, IEnumerable<string>>(
            headers.ToDictionary(kvp => kvp.Key, kvp => kvp.Value, StringComparer.OrdinalIgnoreCase)
        );
    }

    /// <summary>
    /// Creates a new instance of <see cref="ResponseHeaders"/> with the provided headers dictionary.
    /// </summary>
    /// <param name="headers">The underlying header dictionary.</param>
    public ResponseHeaders(IReadOnlyDictionary<string, IEnumerable<string>> headers)
    {
        // Create a case-insensitive copy by manually copying entries
        // (Dictionary constructor with IReadOnlyDictionary is not available in .NET Standard 2.0)
        var dict = new Dictionary<string, IEnumerable<string>>(StringComparer.OrdinalIgnoreCase);
        foreach (var kvp in headers)
        {
            dict[kvp.Key] = kvp.Value;
        }
        _headers = dict;
    }

    /// <summary>
    /// Gets the value of the "Content-Type" header.
    /// </summary>
    public string? ContentType =>
        TryGetValue(HttpHeader.Names.ContentType, out var value) ? value : null;

    /// <summary>
    /// Gets the parsed value of the "Content-Length" header.
    /// </summary>
    public long? ContentLength
    {
        get
        {
            if (!TryGetValue(HttpHeader.Names.ContentLength, out var stringValue))
            {
                return null;
            }

            return long.TryParse(
                stringValue,
                NumberStyles.Integer,
                CultureInfo.InvariantCulture,
                out var longValue
            )
                ? longValue
                : null;
        }
    }

    /// <summary>
    /// Gets the value of the "ETag" header.
    /// </summary>
    public string? ETag => TryGetValue(HttpHeader.Names.ETag, out var value) ? value : null;

    /// <summary>
    /// Gets the value of the "X-Request-Id" header.
    /// </summary>
    public string? RequestId =>
        TryGetValue(HttpHeader.Names.XRequestId, out var value) ? value : null;

    /// <summary>
    /// Gets the parsed value of the "Date" header.
    /// </summary>
    public DateTimeOffset? Date
    {
        get
        {
            if (!TryGetValue(HttpHeader.Names.Date, out var value))
            {
                return null;
            }

            return DateTimeOffset.TryParse(
                value,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var date
            )
                ? date
                : null;
        }
    }

    /// <summary>
    /// Returns the header value if the header exists. If the header has multiple values,
    /// they are joined with a comma.
    /// </summary>
    /// <param name="name">The header name (case-insensitive).</param>
    /// <param name="value">The header value if found.</param>
    /// <returns><c>true</c> if the header exists, otherwise <c>false</c>.</returns>
    public bool TryGetValue(string name, [NotNullWhen(true)] out string? value)
    {
        if (_headers.TryGetValue(name, out var values))
        {
            value = string.Join(", ", values);
            return true;
        }

        value = null;
        return false;
    }

    /// <summary>
    /// Returns all values for the specified header if it exists.
    /// </summary>
    /// <param name="name">The header name (case-insensitive).</param>
    /// <param name="values">The header values if found.</param>
    /// <returns><c>true</c> if the header exists, otherwise <c>false</c>.</returns>
    public bool TryGetValues(string name, [NotNullWhen(true)] out IEnumerable<string>? values)
    {
        if (_headers.TryGetValue(name, out var headerValues))
        {
            values = headerValues;
            return true;
        }

        values = null;
        return false;
    }

    /// <summary>
    /// Returns <c>true</c> if the specified header exists.
    /// </summary>
    /// <param name="name">The header name (case-insensitive).</param>
    /// <returns><c>true</c> if the header exists, otherwise <c>false</c>.</returns>
    public bool Contains(string name)
    {
        return _headers.ContainsKey(name);
    }

    /// <summary>
    /// Returns an enumerator that iterates through the headers.
    /// </summary>
    /// <returns>An enumerator for the headers.</returns>
    public IEnumerator<HttpHeader> GetEnumerator()
    {
        foreach (var kvp in _headers)
        {
            // Join multiple values with comma for the HttpHeader
            yield return new HttpHeader(kvp.Key, string.Join(", ", kvp.Value));
        }
    }

    /// <inheritdoc/>
    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}
