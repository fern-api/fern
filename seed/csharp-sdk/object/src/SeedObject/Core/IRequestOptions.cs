using System;
using System.Collections.Generic;
using System.Net.Http;

namespace SeedObject.Core;

internal interface IRequestOptions
{
    /// <summary>
    /// The Base URL for the API.
    /// </summary>
    public string? BaseUrl { get; init; }

    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public HttpClient? HttpClient { get; init; }

    /// <summary>
    /// The http headers sent with the request.
    /// </summary>
    internal Headers Headers { get; init; }

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
}
