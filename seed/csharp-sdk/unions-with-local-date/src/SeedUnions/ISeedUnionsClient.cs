namespace SeedUnions;

public partial interface ISeedUnionsClient
{
    public IBigunionClient Bigunion { get; }
    public ITypesClient Types { get; }
    public IUnionClient Union { get; }
}
