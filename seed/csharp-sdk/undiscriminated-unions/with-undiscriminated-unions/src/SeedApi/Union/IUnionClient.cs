namespace SeedApi;

public partial interface IUnionClient
{
    WithRawResponseTask<MyUnion> GetAsync(
        MyUnion request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<string, string>> GetmetadataAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdatemetadataAsync(
        MetadataUnion request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> CallAsync(
        Request request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<UnionWithDuplicateTypes> DuplicatetypesunionAsync(
        UnionWithDuplicateTypes request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> NestedunionsAsync(
        NestedUnionRoot request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> TestcamelcasepropertiesAsync(
        UnionTestCamelCasePropertiesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
