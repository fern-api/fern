using SeedApi;

namespace SeedApi.Endpoints;

public partial interface IContainerClient
{
    WithRawResponseTask<IEnumerable<string>> GetAndReturnListOfPrimitivesAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<TypesObjectWithRequiredField>> GetAndReturnListOfObjectsAsync(
        IEnumerable<TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<string>> GetAndReturnSetOfPrimitivesAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<TypesObjectWithRequiredField>> GetAndReturnSetOfObjectsAsync(
        IEnumerable<TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<string, string>> GetAndReturnMapPrimToPrimAsync(
        Dictionary<string, string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<
        Dictionary<string, TypesObjectWithRequiredField>
    > GetAndReturnMapOfPrimToObjectAsync(
        Dictionary<string, TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<
        Dictionary<string, TypesMixedType>
    > GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
        Dictionary<string, TypesMixedType> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithRequiredField> GetAndReturnOptionalAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
