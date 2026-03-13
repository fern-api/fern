namespace SeedApi;

public partial interface IUserserviceClient
{
    Task<CreateResponse> CreateAsync(
        CreateRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
