namespace SeedApi;

public partial interface ISeedApiClient
{
    public ImdbClient Imdb { get; }
}
