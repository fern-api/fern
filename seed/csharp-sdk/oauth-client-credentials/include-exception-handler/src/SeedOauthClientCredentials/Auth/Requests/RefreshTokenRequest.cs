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
    public string Audience { get; set; } = "https://api.example.com";

    [JsonPropertyName("grant_type")]
    public string GrantType { get; set; } = "refresh_token";

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
