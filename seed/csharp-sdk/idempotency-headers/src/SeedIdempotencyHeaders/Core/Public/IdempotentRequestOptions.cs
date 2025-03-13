using System;
using System.Collections.Generic;
using System.Net.Http;
using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders;

public partial class IdempotentRequestOptions : IIdempotentRequestOptions
{
    /// <summary>
    /// The http headers sent with the request.
    /// </summary>
    Headers IRequestOptions.Headers { get; init; } = new();

    /// <summary>
    /// The Base URL for the API.
    /// </summary>
    public string? BaseUrl { get; init; }

    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public HttpClient? HttpClient { get; init; }

    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public int? MaxRetries { get; init; }

    /// <summary>
    /// The timeout for the request.
    /// </summary>
    public TimeSpan? Timeout { get; init; }

    /// <summary>
    /// Additional query parameters sent with the request.
    /// </summary>
    public IEnumerable<KeyValuePair<string, string>> AdditionalQueryParameters { get; init; }

    /// <summary>
    /// Additional body properties sent with the request.
    /// This is only applied to JSON requests.
    /// </summary>
    public object? AdditionalBodyProperties { get; init; }

    public string IdempotencyKey { get; init; }

    public int IdempotencyExpiration { get; init; }

    Headers IIdempotentRequestOptions.GetIdempotencyHeaders()
    {
        return new Headers(
            new Dictionary<string, string>
            {
                ["Idempotency-Key"] = IdempotencyKey,
                ["Idempotency-Expiration"] = IdempotencyExpiration.ToString(),
            }
        );
    }
}
