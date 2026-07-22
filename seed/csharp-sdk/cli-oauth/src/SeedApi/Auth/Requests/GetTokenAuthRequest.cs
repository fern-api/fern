using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record GetTokenAuthRequest
{
    [JsonIgnore]
    public GetTokenAuthRequestAudience? Audience { get; set; }

    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("scopes")]
    public required string Scopes { get; set; }

    [JsonPropertyName("grant_type")]
    public required GetTokenAuthRequestGrantType GrantType { get; set; }

    [JsonPropertyName("tenant")]
    public required string Tenant { get; set; }

    [JsonPropertyName("optional_hint")]
    public string? OptionalHint { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
