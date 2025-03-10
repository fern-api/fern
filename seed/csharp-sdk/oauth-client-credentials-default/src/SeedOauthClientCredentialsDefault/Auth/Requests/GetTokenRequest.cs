using System.Text.Json;
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
    public string GrantType { get; set; } = "client_credentials";

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
