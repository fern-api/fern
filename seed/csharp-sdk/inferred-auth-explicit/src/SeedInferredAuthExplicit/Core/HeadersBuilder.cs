namespace SeedInferredAuthExplicit.Core;

/// <summary>
/// Fluent builder for constructing HTTP headers with support for merging from multiple sources.
/// Provides a clean API for building headers with proper precedence handling.
/// </summary>
internal static class HeadersBuilder
{
    /// <summary>
    /// Fluent builder for constructing HTTP headers.
    /// </summary>
    public sealed class Builder
    {
        private readonly Dictionary<string, HeaderValue> _headers;

        /// <summary>
        /// Initializes a new instance with default capacity.
        /// Uses case-insensitive header name comparison.
        /// </summary>
        public Builder()
        {
            _headers = new Dictionary<string, HeaderValue>(StringComparer.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Initializes a new instance with the specified initial capacity.
        /// Uses case-insensitive header name comparison.
        /// </summary>
        public Builder(int capacity)
        {
            _headers = new Dictionary<string, HeaderValue>(
                capacity,
                StringComparer.OrdinalIgnoreCase
            );
        }

        /// <summary>
        /// Adds a header with the specified key and value.
        /// If a header with the same key already exists, it will be overwritten.
        /// Null values are ignored.
        /// </summary>
        /// <param name="key">The header name.</param>
        /// <param name="value">The header value. Null values are ignored.</param>
        /// <returns>This builder instance for method chaining.</returns>
        public Builder Add(string key, string? value)
        {
            if (value is not null)
            {
                _headers[key] = new HeaderValue(value);
            }
            return this;
        }

        /// <summary>
        /// Adds multiple headers from a Headers dictionary.
        /// HeaderValue instances are stored and will be resolved when BuildAsync() is called.
        /// Overwrites any existing headers with the same key.
        /// Null entries are ignored.
        /// </summary>
        /// <param name="headers">The headers to add. Null is treated as empty.</param>
        /// <returns>This builder instance for method chaining.</returns>
        public Builder Add(Headers? headers)
        {
            if (headers is null)
            {
                return this;
            }

            foreach (var header in headers)
            {
                _headers[header.Key] = header.Value;
            }

            return this;
        }

        /// <summary>
        /// Adds multiple headers from a key-value pair collection.
        /// Overwrites any existing headers with the same key.
        /// Null values are ignored.
        /// </summary>
        /// <param name="headers">The headers to add. Null is treated as empty.</param>
        /// <returns>This builder instance for method chaining.</returns>
        public Builder Add(IEnumerable<KeyValuePair<string, string?>>? headers)
        {
            if (headers is null)
            {
                return this;
            }

            foreach (var header in headers)
            {
                if (header.Value is not null)
                {
                    _headers[header.Key] = new HeaderValue(header.Value);
                }
            }

            return this;
        }

        /// <summary>
        /// Adds multiple headers from a dictionary.
        /// Overwrites any existing headers with the same key.
        /// </summary>
        /// <param name="headers">The headers to add. Null is treated as empty.</param>
        /// <returns>This builder instance for method chaining.</returns>
        public Builder Add(Dictionary<string, string>? headers)
        {
            if (headers is null)
            {
                return this;
            }

            foreach (var header in headers)
            {
                _headers[header.Key] = new HeaderValue(header.Value);
            }

            return this;
        }

        /// <summary>
        /// Asynchronously builds the final headers dictionary containing all merged headers.
        /// Resolves all HeaderValue instances that may contain async operations.
        /// Returns a case-insensitive dictionary.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation, containing a case-insensitive dictionary of headers.</returns>
        public async global::System.Threading.Tasks.Task<Dictionary<string, string>> BuildAsync()
        {
            var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var kvp in _headers)
            {
                var value = await kvp.Value.ResolveAsync().ConfigureAwait(false);
                if (value is not null)
                {
                    headers[kvp.Key] = value;
                }
            }
            return headers;
        }
    }
}
