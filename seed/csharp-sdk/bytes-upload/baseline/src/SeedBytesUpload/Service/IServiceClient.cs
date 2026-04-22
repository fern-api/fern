namespace SeedBytesUpload;

public partial interface IServiceClient
{
    Task UploadAsync(
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task UploadWithQueryParamsAsync(
        UploadWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
