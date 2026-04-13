namespace SeedApi;

public partial interface IServiceClient
{
    Task UploadAsync(
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task UploadwithqueryparamsAsync(
        ServiceUploadWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
