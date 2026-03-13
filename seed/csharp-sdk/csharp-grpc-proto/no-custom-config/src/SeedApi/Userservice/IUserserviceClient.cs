namespace SeedApi;

public partial interface IUserServiceClient
{
    Task<CreateResponse> CreateAsync(
        CreateRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
