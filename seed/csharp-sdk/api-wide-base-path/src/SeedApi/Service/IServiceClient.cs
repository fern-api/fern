namespace SeedApi;

public partial interface IServiceClient
{
    Task PostAsync(
        ServicePostRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
