using System.Text.Json.Serialization;

namespace SeedOauthClientCredentials;

public class TokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; init; }

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; init; }

    [JsonPropertyName("refresh_token")]
    public List<string?> RefreshToken { get; init; }
}
