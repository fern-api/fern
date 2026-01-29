namespace SeedMultiUrlEnvironmentNoDefault;

public partial interface IS3Client
{
    WithRawResponseTask<string> GetPresignedUrlAsync(
        GetPresignedUrlRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
