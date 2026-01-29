using SeedExamples;

namespace SeedExamples.File_;

public partial interface IServiceClient
{
    /// <summary>
    /// This endpoint returns a file by its name.
    /// </summary>
    WithRawResponseTask<SeedExamples.File> GetFileAsync(
        string filename,
        GetFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
