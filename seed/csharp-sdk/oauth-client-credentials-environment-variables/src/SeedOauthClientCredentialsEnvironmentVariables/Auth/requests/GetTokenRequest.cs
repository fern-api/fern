namespace SeedOauthClientCredentialsEnvironmentVariables;

public class GetTokenRequest
{
    public string ClientId { get; init; }

    public string ClientSecret { get; init; }

    public string Audience { get; init; }

    public string GrantType { get; init; }

    public string? Scope { get; init; }
}
