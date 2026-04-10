using OneOf;

namespace SeedApi;

public partial interface IUnionClient
{
    WithRawResponseTask<
        OneOf<string, int, IEnumerable<int>, IEnumerable<IEnumerable<int>>, IEnumerable<string>>
    > GetAsync(
        OneOf<
            string,
            int,
            IEnumerable<int>,
            IEnumerable<IEnumerable<int>>,
            IEnumerable<string>
        > request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<string, string>> GetmetadataAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdatemetadataAsync(
        OneOf<Dictionary<string, object?>?, NamedMetadata> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> CallAsync(
        Request request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<OneOf<string, int, IEnumerable<string>>> DuplicatetypesunionAsync(
        OneOf<string, int, IEnumerable<string>> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> NestedunionsAsync(
        OneOf<
            string,
            IEnumerable<string>,
            OneOf<int, IEnumerable<string>, OneOf<bool, IEnumerable<string>>>
        > request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> TestcamelcasepropertiesAsync(
        UnionTestCamelCasePropertiesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
