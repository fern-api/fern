using System;
using System.Net.Http;
using SeedMultiUrlEnvironmentNoDefault.Core;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault.Core;

public partial class RequestOptions
{
    /// <summary>
    /// The Environment for the API.
    /// </summary>
    public SeedMultiUrlEnvironmentNoDefaultEnvironment? Environment { get; init; }

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
}
