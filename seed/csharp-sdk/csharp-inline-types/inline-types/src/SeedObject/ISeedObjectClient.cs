namespace SeedObject;

public partial interface ISeedObjectClient
{
    WithRawResponseTask<RootType1> GetRootAsync(
        PostRootRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask GetDiscriminatedUnionAsync(
        GetDiscriminatedUnionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask GetUndiscriminatedUnionAsync(
        GetUndiscriminatedUnionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
