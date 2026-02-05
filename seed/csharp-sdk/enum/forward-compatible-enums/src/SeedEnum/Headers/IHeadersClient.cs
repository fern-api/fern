namespace SeedEnum;

public partial interface IHeadersClient
{
    Task SendAsync(
        SendEnumAsHeaderRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
