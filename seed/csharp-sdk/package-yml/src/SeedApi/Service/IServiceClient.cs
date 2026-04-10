namespace SeedApi;

public partial interface IServiceClient
{
    Task NopAsync(
        ServiceNopRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
