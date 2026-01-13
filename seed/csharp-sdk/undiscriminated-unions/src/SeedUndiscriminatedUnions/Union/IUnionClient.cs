using OneOf;

namespace SeedUndiscriminatedUnions;

public partial interface IUnionClient
{
    Task<
        OneOf<
            string,
            IEnumerable<string>,
            int,
            IEnumerable<int>,
            IEnumerable<IEnumerable<int>>,
            HashSet<string>
        >
    > GetAsync(
        OneOf<
            string,
            IEnumerable<string>,
            int,
            IEnumerable<int>,
            IEnumerable<IEnumerable<int>>,
            HashSet<string>
        > request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Dictionary<OneOf<KeyType, string>, string>> GetMetadataAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<bool> UpdateMetadataAsync(
        OneOf<Dictionary<string, object?>?, NamedMetadata> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<bool> CallAsync(
        Request request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<OneOf<string, IEnumerable<string>, int, HashSet<string>>> DuplicateTypesUnionAsync(
        OneOf<string, IEnumerable<string>, int, HashSet<string>> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<string> NestedUnionsAsync(
        OneOf<
            string,
            IEnumerable<string>,
            OneOf<
                int,
                HashSet<string>,
                IEnumerable<string>,
                OneOf<bool, HashSet<string>, IEnumerable<string>>
            >
        > request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<string> TestCamelCasePropertiesAsync(
        PaymentRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
