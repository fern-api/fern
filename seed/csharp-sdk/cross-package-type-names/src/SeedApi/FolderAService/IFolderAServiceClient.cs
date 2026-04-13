namespace SeedApi;

public partial interface IFolderAServiceClient
{
    WithRawResponseTask<FolderAResponse> FolderAServiceGetDirectThreadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
