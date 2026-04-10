namespace SeedApi;

public partial interface IMultipartformClient
{
    Task MultipartformAsync(
        MultipartFormMultipartFormRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
