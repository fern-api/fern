namespace SeedMultiUrlEnvironment;

public partial interface IS3Client
{
    Task<string> GetPresignedUrlAsync(
        GetPresignedUrlRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
