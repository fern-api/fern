namespace SeedApi;

public partial interface ISeedApiClient
{
    public IItemsClient Items { get; }
    public IAuthClient Auth { get; }
    public IFilesClient Files { get; }
}
