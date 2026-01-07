namespace SeedEnum;

public partial interface IMultipartFormClient
{
    Task MultipartFormAsync(
        MultipartFormRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
