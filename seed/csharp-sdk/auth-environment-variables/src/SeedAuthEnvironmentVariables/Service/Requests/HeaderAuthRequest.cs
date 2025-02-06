using SeedAuthEnvironmentVariables.Core;

    namespace SeedAuthEnvironmentVariables;

public record HeaderAuthRequest
{
    /// <summary>
    /// Specifies the endpoint key.
    /// </summary>
    public required string XEndpointHeader { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
