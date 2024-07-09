using System.Text.Json.Serialization;

#nullable enable

namespace SeedOauthClientCredentials.Auth;

public record TokenResponse
{
    [JsonPropertyName("access_token")]
    public required string AccessToken { get; init; }

    [JsonPropertyName("expires_in")]
    public required int ExpiresIn { get; init; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; init; }
}
