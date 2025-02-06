using System.Text.Json.Serialization;
using SeedOauthClientCredentialsDefault.Core;

namespace SeedOauthClientCredentialsDefault;

public record GetTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("grant_type")]
    public required string GrantType { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
