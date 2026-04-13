using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record GetTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("audience")]
    public required GetTokenRequestAudience Audience { get; set; }

    [JsonPropertyName("grant_type")]
    public required GetTokenRequestGrantType GrantType { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
