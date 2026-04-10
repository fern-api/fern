namespace SeedApi;

public partial interface IClient
{
    WithRawResponseTask<UnionResponse> GetUnionAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<UnionListResponse> ListUnionsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
