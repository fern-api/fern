namespace SeedApi;

public partial interface ISeedApiClient
{
    public IAbClient Ab { get; }
    public IAcClient Ac { get; }
    public IFolderClient Folder { get; }
    public IFolderServiceClient FolderService { get; }
    Task FooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
