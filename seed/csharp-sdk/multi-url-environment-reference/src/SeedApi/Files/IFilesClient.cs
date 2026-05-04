namespace SeedApi;

public partial interface IFilesClient
{
    WithRawResponseTask<string> UploadAsync(
        FilesUploadRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
