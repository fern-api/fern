#if !NETFRAMEWORK

namespace SeedBearerTokenEnvironmentVariable.Extensions;

/// <summary>
/// Configuration options for the <see cref="SeedBearerTokenEnvironmentVariableClient"/> when using dependency injection.
/// </summary>
public class SeedBearerTokenEnvironmentVariableClientOptions
{
    /// <summary>
    /// The apiKey to use for authentication.
    /// </summary>
    public string? ApiKey { get; set; }

    /// <summary>
    /// The base URL for the API. If not specified, the default environment URL is used.
    /// </summary>
    public string? BaseUrl { get; set; }

    /// <summary>
    /// The maximum number of retries for failed requests. Defaults to 2.
    /// </summary>
    public int MaxRetries { get; set; } = 2;

    /// <summary>
    /// The timeout for HTTP requests. Defaults to 30 seconds.
    /// </summary>
    public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(30);
}

#endif
