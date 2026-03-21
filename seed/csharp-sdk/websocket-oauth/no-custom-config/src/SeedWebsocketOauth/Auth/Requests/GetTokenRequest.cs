using System.Text.Json.Serialization;
using SeedWebsocketOauth.Core;

namespace SeedWebsocketOauth;

[Serializable]
public record GetTokenRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("grant_type")]
    public string GrantType { get; set; } = "client_credentials";

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
