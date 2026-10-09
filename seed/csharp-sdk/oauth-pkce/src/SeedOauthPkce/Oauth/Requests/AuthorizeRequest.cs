using global::System.Text.Json.Serialization;
using SeedOauthPkce.Core;

namespace SeedOauthPkce;

[Serializable]
public record AuthorizeRequest
{
    [JsonIgnore]
    public string ResponseType { get; set; } = "code";

    [JsonIgnore]
    public required string ClientId { get; set; }

    [JsonIgnore]
    public required string RedirectUri { get; set; }

    [JsonIgnore]
    public required string CodeChallenge { get; set; }

    [JsonIgnore]
    public string? CodeChallengeMethod { get; set; }

    [JsonIgnore]
    public string? Scope { get; set; }

    [JsonIgnore]
    public string? State { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
