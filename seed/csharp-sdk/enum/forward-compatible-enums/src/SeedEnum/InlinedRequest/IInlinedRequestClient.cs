namespace SeedEnum;

public partial interface IInlinedRequestClient
{
    Task SendAsync(
        SendEnumInlinedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
