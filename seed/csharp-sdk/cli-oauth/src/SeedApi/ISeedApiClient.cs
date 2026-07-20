namespace SeedApi;

public partial interface ISeedApiClient
{
    public IAuthClient Auth { get; }
    public ISystemClient System { get; }
    public IPetsClient Pets { get; }
}
