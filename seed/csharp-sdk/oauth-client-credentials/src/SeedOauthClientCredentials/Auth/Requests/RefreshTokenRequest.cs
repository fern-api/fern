using System.Text.Json.Serialization;

#nullable enable

namespace SeedOauthClientCredentials;

public record RefreshTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; init; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; init; }

    [JsonPropertyName("refresh_token")]
    public required string RefreshToken { get; init; }

    [JsonPropertyName("audience")]
    public required string Audience { get; init; }

    [JsonPropertyName("grant_type")]
    public required string GrantType { get; init; }

    [JsonPropertyName("scope")]
    public string? Scope { get; init; }
}
