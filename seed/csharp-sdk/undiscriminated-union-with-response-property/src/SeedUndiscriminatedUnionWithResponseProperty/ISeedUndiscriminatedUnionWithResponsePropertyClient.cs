namespace SeedUndiscriminatedUnionWithResponseProperty;

public partial interface ISeedUndiscriminatedUnionWithResponsePropertyClient
{
    Task<UnionResponse> GetUnionAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<UnionListResponse> ListUnionsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
