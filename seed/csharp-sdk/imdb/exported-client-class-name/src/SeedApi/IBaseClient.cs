namespace SeedApi;

public partial interface IBaseClient
{
    public IImdbClient Imdb { get; }
}
