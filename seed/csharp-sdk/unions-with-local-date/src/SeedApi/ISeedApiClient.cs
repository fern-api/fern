namespace SeedApi;

public partial interface ISeedApiClient
{
    public IBigunionClient Bigunion { get; }
    public ITypesClient Types { get; }
    public IUnionClient Union { get; }
}
