using System.Text.Json.Serialization;
using SeedOauthClientCredentials.Core;

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
    public string Audience { get; set; } = "https://api.example.com";

    [JsonPropertyName("grant_type")]
    public string GrantType { get; set; } = "client_credentials";

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
