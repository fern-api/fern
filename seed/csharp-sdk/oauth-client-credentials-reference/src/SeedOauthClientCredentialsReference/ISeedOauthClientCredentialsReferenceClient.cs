namespace SeedOauthClientCredentialsReference;

public partial interface ISeedOauthClientCredentialsReferenceClient
{
    public AuthClient Auth { get; }
    public SimpleClient Simple { get; }
}
