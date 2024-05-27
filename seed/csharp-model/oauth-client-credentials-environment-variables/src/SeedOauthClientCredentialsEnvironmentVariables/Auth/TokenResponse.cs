using System.Text.Json.Serialization;

namespace SeedOauthClientCredentialsEnvironmentVariables;

public class TokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; init; }

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; init; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; init; }
}
