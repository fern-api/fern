namespace SeedOauthClientCredentialsEnvironmentVariables;

public class RefreshTokenRequest
{
    public string ClientId { get; init; }

    public string ClientSecret { get; init; }

    public string RefreshToken { get; init; }

    public string Audience { get; init; }

    public string GrantType { get; init; }

    public string? Scope { get; init; }
}
