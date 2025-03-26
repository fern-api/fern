using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using SeedLiteral.Core;

namespace SeedLiteral;

public partial class RequestOptions : IRequestOptions
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
    /// Additional headers to be sent with the request.
    /// Headers previously set with matching keys will be overwritten.
    /// </summary>
    public IEnumerable<KeyValuePair<string, string?>> AdditionalHeaders { get; init; } = [];

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
    public IEnumerable<KeyValuePair<string, string>> AdditionalQueryParameters { get; init; } =
        Enumerable.Empty<KeyValuePair<string, string>>();

    /// <summary>
    /// Additional body properties sent with the request.
    /// This is only applied to JSON requests.
    /// </summary>
    public object? AdditionalBodyProperties { get; init; }

    public string? Version { get; init; }

    public bool? AuditLogging { get; init; }
}
