namespace SeedAuthEnvironmentVariables;

public record HeaderAuthRequest
{
    /// <summary>
    /// Specifies the endpoint key.
    /// </summary>
    public required string XEndpointHeader { get; set; }
}
