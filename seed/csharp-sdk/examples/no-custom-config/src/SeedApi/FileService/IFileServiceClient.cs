namespace SeedApi;

public partial interface IFileServiceClient
{
    /// <summary>
    /// This endpoint returns a file by its name.
    /// </summary>
    WithRawResponseTask<File> FileServiceGetFileAsync(
        FileServiceGetFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
