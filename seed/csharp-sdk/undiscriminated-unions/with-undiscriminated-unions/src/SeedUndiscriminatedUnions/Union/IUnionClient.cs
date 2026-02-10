namespace SeedUndiscriminatedUnions;

public partial interface IUnionClient
{
    WithRawResponseTask<MyUnion> GetAsync(
        MyUnion request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<Key, string>> GetMetadataAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdateMetadataAsync(
        MetadataUnion request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> CallAsync(
        Request request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<UnionWithDuplicateTypes> DuplicateTypesUnionAsync(
        UnionWithDuplicateTypes request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> NestedUnionsAsync(
        NestedUnionRoot request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> TestCamelCasePropertiesAsync(
        PaymentRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
