using global::System.Text.Json.Serialization;
using SeedCsharpOauthTokenOptional.Core;

namespace SeedCsharpOauthTokenOptional;

[Serializable]
public record CreateOauth2TokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("grant_type")]
    public string? GrantType { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
