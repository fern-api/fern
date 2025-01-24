using System.Text.Json.Serialization;
using SeedOauthClientCredentials.Core;

#nullable enable

namespace SeedOauthClientCredentials;

public record GetTokenRequest
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
    public required string Audience { get; set; }

    [JsonPropertyName("grant_type")]
    public required string GrantType { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
