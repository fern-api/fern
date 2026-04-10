namespace SeedApi;

public partial interface ISeedApiClient
{
    public IUsersClient Users { get; }
}
