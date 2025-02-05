using System.Text.Json.Serialization;
using SeedOauthClientCredentials.Core;

namespace SeedOauthClientCredentials;

public record RefreshTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("refresh_token")]
    public required string RefreshToken { get; set; }

    [JsonPropertyName("audience")]
    public required string Audience { get; set; }

    [JsonPropertyName("grant_type")]
    public required string GrantType { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
