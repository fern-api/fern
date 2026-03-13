namespace SeedApi;

public partial interface ISeedApiClient
{
    public IUserserviceClient Userservice { get; }
}
