namespace SeedApi;

public partial interface ISeedApiClient
{
    public IUserClient User { get; }
}
