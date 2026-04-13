namespace SeedApi;

public partial interface IFolderAServiceClient
{
    WithRawResponseTask<FolderAResponse> FolderAServiceGetDirectThreadAsync(
        FolderAServiceGetDirectThreadRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
