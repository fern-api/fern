namespace SeedApi.Core;

public class ClientOptions
{
    public string BaseUrl { get; init; }
    
    public string MaxRetries { get; init; }
    
    public string Timeout { get; init; }
}