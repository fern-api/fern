namespace SeedApi;

public partial interface ISeedApiClient
{
    public IUserServiceClient UserService { get; }
}
