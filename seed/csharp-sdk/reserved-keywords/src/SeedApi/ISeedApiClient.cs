namespace SeedApi;

public partial interface ISeedApiClient
{
    public IPackageClient Package { get; }
}
