using global::System.Collections;
using global::System.Net.Http.Headers;

namespace SeedNoRetries.Core;

/// <summary>
/// Represents HTTP response headers with case-insensitive lookup.
/// </summary>
public readonly struct ResponseHeaders : IEnumerable<HttpHeader>
{
    private readonly HttpResponseHeaders? _headers;
    private readonly HttpContentHeaders? _contentHeaders;

    private ResponseHeaders(HttpResponseHeaders headers, HttpContentHeaders? contentHeaders)
    {
        _headers = headers;
        _contentHeaders = contentHeaders;
    }

    /// <summary>
    /// Gets the Content-Type header value, if present.
    /// </summary>
    public string? ContentType => _contentHeaders?.ContentType?.ToString();

    /// <summary>
    /// Gets the Content-Length header value, if present.
    /// </summary>
    public long? ContentLength => _contentHeaders?.ContentLength;

    /// <summary>
    /// Creates a ResponseHeaders instance from an HttpResponseMessage.
    /// </summary>
    public static ResponseHeaders FromHttpResponseMessage(HttpResponseMessage response)
    {
        return new ResponseHeaders(response.Headers, response.Content?.Headers);
    }

    /// <summary>
    /// Tries to get a single header value. Returns the first value if multiple values exist.
    /// </summary>
    public bool TryGetValue(string name, out string? value)
    {
        if (TryGetValues(name, out var values) && values is not null)
        {
            value = values.FirstOrDefault();
            return true;
        }

        value = null;
        return false;
    }

    /// <summary>
    /// Tries to get all values for a header.
    /// </summary>
    public bool TryGetValues(string name, out IEnumerable<string>? values)
    {
        if (_headers?.TryGetValues(name, out values) == true)
        {
            return true;
        }

        if (_contentHeaders?.TryGetValues(name, out values) == true)
        {
            return true;
        }

        values = null;
        return false;
    }

    /// <summary>
    /// Checks if the headers contain a specific header name.
    /// </summary>
    public bool Contains(string name)
    {
        return _headers?.Contains(name) == true || _contentHeaders?.Contains(name) == true;
    }

    /// <summary>
    /// Gets an enumerator for all headers.
    /// </summary>
    public IEnumerator<HttpHeader> GetEnumerator()
    {
        if (_headers is not null)
        {
            foreach (var header in _headers)
            {
                yield return new HttpHeader(header.Key, string.Join(", ", header.Value));
            }
        }

        if (_contentHeaders is not null)
        {
            foreach (var header in _contentHeaders)
            {
                yield return new HttpHeader(header.Key, string.Join(", ", header.Value));
            }
        }
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

/// <summary>
/// Represents a single HTTP header.
/// </summary>
public readonly record struct HttpHeader(string Name, string Value);
