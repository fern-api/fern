using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record AuthRefreshTokenRequest
{
    [JsonIgnore]
    public required string ApiKey { get; set; }

    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("refresh_token")]
    public required string RefreshToken { get; set; }

    [JsonPropertyName("audience")]
    public required AuthRefreshTokenRequestAudience Audience { get; set; }

    [JsonPropertyName("grant_type")]
    public required AuthRefreshTokenRequestGrantType GrantType { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
