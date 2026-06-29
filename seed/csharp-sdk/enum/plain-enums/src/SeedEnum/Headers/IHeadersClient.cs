namespace SeedEnum;

public partial interface IHeadersClient
{
    WithRawResponseTask SendAsync(
        SendEnumAsHeaderRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
