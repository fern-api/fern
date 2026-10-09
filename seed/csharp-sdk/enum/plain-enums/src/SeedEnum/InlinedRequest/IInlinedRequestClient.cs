namespace SeedEnum;

public partial interface IInlinedRequestClient
{
    WithRawResponseTask SendAsync(
        SendEnumInlinedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
