using System.Text.Json.Serialization;

#nullable enable

namespace SeedOauthClientCredentialsDefault;

public record GetTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("grant_type")]
    public required string GrantType { get; set; }
}
