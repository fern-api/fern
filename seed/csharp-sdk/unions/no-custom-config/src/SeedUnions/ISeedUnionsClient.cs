namespace SeedUnions;

public partial interface ISeedUnionsClient
{
    public BigunionClient Bigunion { get; }
    public UnionClient Union { get; }
}
