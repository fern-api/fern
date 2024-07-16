using System.Text.Json.Serialization;

#nullable enable

namespace SeedOauthClientCredentialsDefault;

public record GetTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; init; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; init; }

    [JsonPropertyName("grant_type")]
    public required string GrantType { get; init; }
}
