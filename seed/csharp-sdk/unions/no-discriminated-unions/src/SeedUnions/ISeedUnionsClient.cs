namespace SeedUnions;

public partial interface ISeedUnionsClient
{
    public IBigunionClient Bigunion { get; }
    public IUnionClient Union { get; }
}
