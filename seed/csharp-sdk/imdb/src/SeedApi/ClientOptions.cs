namespace SeedApi;

public class ClientOptions
{
    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public HttpClient HttpClient { get; init;} = new HttpClient();
    
    /// <summary>
    /// The maximum number of retries to attempt if a request fails.
    /// </summary>
    public int MaxRetries { get; init; } = 2;
    
    /// <summary>
    /// The timeout for the request in seconds.
    /// </summary>
    public int TimeoutInSeconds { get; init; } = 60;
}