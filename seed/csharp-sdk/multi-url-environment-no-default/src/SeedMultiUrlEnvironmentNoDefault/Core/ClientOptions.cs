using System.Net.Http;
using SeedMultiUrlEnvironmentNoDefault.Core;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault.Core;

public partial class ClientOptions
{
    /// <summary>
    /// The Environment for the API.
    /// </summary>
    public SeedMultiUrlEnvironmentNoDefaultEnvironment Environment { get; init; } = null;

    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public HttpClient HttpClient { get; init; } = new HttpClient();

    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public int MaxRetries { get; init; } = 2;

    /// <summary>
    /// The timeout for the request in seconds.
    /// </summary>
    public int TimeoutInSeconds { get; init; } = 30;
}
