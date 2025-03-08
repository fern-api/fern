using System.Text.Json.Serialization;
using SeedOauthClientCredentialsDefault.Core;

namespace SeedOauthClientCredentialsDefault;

/// <summary>
/// An OAuth token response.
/// </summary>
public record TokenResponse
{
    [JsonPropertyName("access_token")]
    public required string AccessToken { get; set; }

    [JsonPropertyName("expires_in")]
    public required int ExpiresIn { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
