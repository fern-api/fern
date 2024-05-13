namespace SeedOauthClientCredentialsDefault;

public class GetTokenRequest
{
    public string ClientId { get; init; }

    public string ClientSecret { get; init; }

    public string GrantType { get; init; }
}
