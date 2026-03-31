namespace SeedUndiscriminatedUnionWithResponseProperty;

public partial interface ISeedUndiscriminatedUnionWithResponsePropertyClient
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
