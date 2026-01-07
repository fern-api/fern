namespace SeedAnyAuth;

public partial interface ISeedAnyAuthClient
{
    public AuthClient Auth { get; }
    public UserClient User { get; }
}
