namespace SeedApi;

public partial interface IFileUploadExampleClient
{
    /// <summary>
    /// Upload a file to the database
    /// </summary>
    WithRawResponseTask<string> UploadFileAsync(
        UploadFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
