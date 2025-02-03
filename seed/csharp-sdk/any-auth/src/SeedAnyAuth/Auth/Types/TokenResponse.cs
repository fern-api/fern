using System.Text.Json.Serialization;
using SeedAnyAuth.Core;

namespace SeedAnyAuth;

public record TokenResponse
{
    [JsonPropertyName("access_token")]
    public required string AccessToken { get; set; }

    [JsonPropertyName("expires_in")]
    public required int ExpiresIn { get; set; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
