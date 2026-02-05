namespace SeedApi;

public partial interface ISeedApiClient
{
    public ITestGroupClient TestGroup { get; }
}
