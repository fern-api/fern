using System.Text.Json.Serialization;

#nullable enable

namespace SeedOauthClientCredentialsDefault;

public record TokenResponse
{
    [JsonPropertyName("access_token")]
    public required string AccessToken { get; init; }

    [JsonPropertyName("expires_in")]
    public required int ExpiresIn { get; init; }
}
