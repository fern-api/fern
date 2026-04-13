using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record AuthGetTokenWithClientCredentialsRequest
{
    [JsonPropertyName("cid")]
    public required string Cid { get; set; }

    [JsonPropertyName("csr")]
    public required string Csr { get; set; }

    [JsonPropertyName("scp")]
    public required string Scp { get; set; }

    [JsonPropertyName("entity_id")]
    public required string EntityId { get; set; }

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
