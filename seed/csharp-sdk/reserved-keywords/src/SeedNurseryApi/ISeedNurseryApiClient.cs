namespace SeedNurseryApi;

public partial interface ISeedNurseryApiClient
{
    public IPackageClient Package { get; }
}
