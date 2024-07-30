using System.Text.Json.Serialization;

#nullable enable

namespace SeedOauthClientCredentials;

public record GetTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; }

    [JsonPropertyName("audience")]
    public required string Audience { get; }

    [JsonPropertyName("grant_type")]
    public required string GrantType { get; }

    [JsonPropertyName("scope")]
    public string? Scope { get; }
}
