using System.Text.Json.Serialization;

#nullable enable

namespace SeedOauthClientCredentialsEnvironmentVariables;

public record RefreshTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; }

    [JsonPropertyName("refresh_token")]
    public required string RefreshToken { get; }

    [JsonPropertyName("audience")]
    public required string Audience { get; }

    [JsonPropertyName("grant_type")]
    public required string GrantType { get; }

    [JsonPropertyName("scope")]
    public string? Scope { get; }
}
