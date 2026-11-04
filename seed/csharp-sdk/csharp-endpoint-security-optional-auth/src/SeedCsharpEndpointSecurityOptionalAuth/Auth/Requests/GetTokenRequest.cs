using global::System.Text.Json.Serialization;
using SeedCsharpEndpointSecurityOptionalAuth.Core;

namespace SeedCsharpEndpointSecurityOptionalAuth;

[Serializable]
public record GetTokenRequest
{
    [JsonPropertyName("grant_type")]
    public required string GrantType { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
