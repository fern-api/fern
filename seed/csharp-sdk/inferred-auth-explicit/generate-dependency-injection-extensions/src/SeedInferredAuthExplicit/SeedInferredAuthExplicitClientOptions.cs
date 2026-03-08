#if !NETFRAMEWORK

namespace SeedInferredAuthExplicit;

/// <summary>
/// Configuration options for the <see cref="SeedInferredAuthExplicitClient"/> when using dependency injection.
/// </summary>
public class SeedInferredAuthExplicitClientOptions
{
    /// <summary>
    /// The xApiKey for authentication.
    /// </summary>
    public string? XApiKey { get; set; }

    /// <summary>
    /// The clientId for authentication.
    /// </summary>
    public string? ClientId { get; set; }

    /// <summary>
    /// The clientSecret for authentication.
    /// </summary>
    public string? ClientSecret { get; set; }

    /// <summary>
    /// The scope for authentication.
    /// </summary>
    public string? Scope { get; set; }

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
