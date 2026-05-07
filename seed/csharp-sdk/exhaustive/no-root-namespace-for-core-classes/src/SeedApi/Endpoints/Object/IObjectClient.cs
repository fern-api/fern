using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

public partial interface IObjectClient
{
    WithRawResponseTask<TypesObjectWithOptionalField> GetAndReturnWithOptionalFieldAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithRequiredField> GetAndReturnWithRequiredFieldAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithMapOfMap> GetAndReturnWithMapOfMapAsync(
        TypesObjectWithMapOfMap request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesNestedObjectWithOptionalField> GetAndReturnNestedWithOptionalFieldAsync(
        TypesNestedObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesNestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsync(
        GetAndReturnNestedWithRequiredFieldObjectRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesNestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsListAsync(
        IEnumerable<TypesNestedObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithUnknownField> GetAndReturnWithUnknownFieldAsync(
        TypesObjectWithUnknownField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithDocumentedUnknownType> GetAndReturnWithDocumentedUnknownTypeAsync(
        TypesObjectWithDocumentedUnknownType request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<string, object?>> GetAndReturnMapOfDocumentedUnknownTypeAsync(
        Dictionary<string, object?> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    /// </summary>
    WithRawResponseTask<TypesObjectWithDatetimeLikeString> GetAndReturnWithDatetimeLikeStringAsync(
        TypesObjectWithDatetimeLikeString request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
