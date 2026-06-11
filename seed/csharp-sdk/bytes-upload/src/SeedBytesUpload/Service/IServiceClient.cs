namespace SeedBytesUpload;

public partial interface IServiceClient
{
    WithRawResponseTask UploadAsync(
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask UploadWithQueryParamsAsync(
        UploadWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
