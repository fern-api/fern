using System.Text.Json.Serialization;

#nullable enable

namespace SeedOauthClientCredentialsDefault;

public class GetTokenRequest
{
    [JsonPropertyName("client_id")]
    public string ClientId { get; init; }

    [JsonPropertyName("client_secret")]
    public string ClientSecret { get; init; }

    [JsonPropertyName("grant_type")]
    public string GrantType { get; init; }
}
