namespace SeedApi;

public partial interface IFolderDServiceClient
{
    WithRawResponseTask<FolderDResponse> FolderDServiceGetDirectThreadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
