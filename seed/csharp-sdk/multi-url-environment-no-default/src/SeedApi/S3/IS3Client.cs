namespace SeedApi;

public partial interface IS3Client
{
    WithRawResponseTask<string> GetpresignedurlAsync(
        S3GetPresignedUrlRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
