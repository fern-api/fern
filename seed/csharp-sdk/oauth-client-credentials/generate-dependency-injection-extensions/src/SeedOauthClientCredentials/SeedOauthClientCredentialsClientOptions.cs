#if !NETFRAMEWORK

namespace SeedOauthClientCredentials;

/// <summary>
/// Configuration options for the <see cref="SeedOauthClientCredentialsClient"/> when using dependency injection.
/// </summary>
public class SeedOauthClientCredentialsClientOptions
{
    /// <summary>
    /// The client ID for OAuth authentication.
    /// </summary>
    public string? ClientId { get; set; }

    /// <summary>
    /// The client secret for OAuth authentication.
    /// </summary>
    public string? ClientSecret { get; set; }

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
