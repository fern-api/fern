namespace SeedApi;

public partial interface ISeedApiClient
{
    public IAuthClient Auth { get; }
    public INestedNoAuthApiClient NestedNoAuthApi { get; }
    public INestedApiClient NestedApi { get; }
    public ISimpleClient Simple { get; }
}
