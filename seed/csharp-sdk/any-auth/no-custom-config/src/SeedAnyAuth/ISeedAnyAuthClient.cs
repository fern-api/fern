namespace SeedAnyAuth;

public partial interface ISeedAnyAuthClient
{
    public IAuthClient Auth { get; }
    public IUserClient User { get; }
}
