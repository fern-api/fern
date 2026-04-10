using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record AuthGetTokenWithClientCredentialsRequest
{
    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("audience")]
    public required AuthGetTokenWithClientCredentialsRequestAudience Audience { get; set; }

    [JsonPropertyName("grant_type")]
    public required AuthGetTokenWithClientCredentialsRequestGrantType GrantType { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
