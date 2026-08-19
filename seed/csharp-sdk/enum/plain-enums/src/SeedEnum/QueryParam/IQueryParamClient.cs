namespace SeedEnum;

public partial interface IQueryParamClient
{
    WithRawResponseTask SendAsync(
        SendEnumAsQueryParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask SendListAsync(
        SendEnumListAsQueryParamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
