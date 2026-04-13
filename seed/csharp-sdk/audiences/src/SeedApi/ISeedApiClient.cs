namespace SeedApi;

public partial interface ISeedApiClient
{
    public IFolderAServiceClient FolderAService { get; }
    public IFooClient Foo { get; }
    public IFolderDServiceClient FolderDService { get; }
}
