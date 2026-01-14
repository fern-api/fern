namespace SeedUnions;

public partial interface ISeedUnionsClient
{
    public BigunionClient Bigunion { get; }
    public TypesClient Types { get; }
    public UnionClient Union { get; }
}
