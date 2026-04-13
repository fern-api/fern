namespace SeedApi;

public partial interface ISeedApiClient
{
    public ICompletionsClient Completions { get; }
}
