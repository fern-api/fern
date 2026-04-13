namespace SeedApi;

public partial interface ISeedApiClient
{
    public IAuthClient Auth { get; }
}
