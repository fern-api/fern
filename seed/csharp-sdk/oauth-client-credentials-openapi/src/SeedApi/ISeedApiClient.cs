namespace SeedApi;

public partial interface ISeedApiClient
{
    public IIdentityClient Identity { get; }
    public IPlantsClient Plants { get; }
}
