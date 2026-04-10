namespace SeedApi;

public partial interface ISeedApiClient
{
    public IClient _ { get; }
    public IAbClient Ab { get; }
    public IAcClient Ac { get; }
    public IFolderClient Folder { get; }
    public IFolderServiceClient FolderService { get; }
}
