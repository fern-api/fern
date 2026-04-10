namespace SeedApi;

public partial interface ISeedApiClient
{
    public IFolderAServiceClient FolderAService { get; }
    public IFolderDServiceClient FolderDService { get; }
    public IFooClient Foo { get; }
}
