namespace SeedApi;

public partial interface ISeedApiClient
{
    public IImdbClient Imdb { get; }
}
