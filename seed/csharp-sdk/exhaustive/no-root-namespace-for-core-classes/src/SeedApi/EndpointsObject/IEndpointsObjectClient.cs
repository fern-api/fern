using SeedApi.Core;

namespace SeedApi;

public partial interface IEndpointsObjectClient
{
    WithRawResponseTask<TypesObjectWithOptionalField> EndpointsObjectGetAndReturnWithOptionalFieldAsync(
        TypesObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithRequiredField> EndpointsObjectGetAndReturnWithRequiredFieldAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithMapOfMap> EndpointsObjectGetAndReturnWithMapOfMapAsync(
        TypesObjectWithMapOfMap request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesNestedObjectWithOptionalField> EndpointsObjectGetAndReturnNestedWithOptionalFieldAsync(
        TypesNestedObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesNestedObjectWithRequiredField> EndpointsObjectGetAndReturnNestedWithRequiredFieldAsync(
        EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesNestedObjectWithRequiredField> EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsync(
        IEnumerable<TypesNestedObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithUnknownField> EndpointsObjectGetAndReturnWithUnknownFieldAsync(
        TypesObjectWithUnknownField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithDocumentedUnknownType> EndpointsObjectGetAndReturnWithDocumentedUnknownTypeAsync(
        TypesObjectWithDocumentedUnknownType request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<
        Dictionary<string, object?>
    > EndpointsObjectGetAndReturnMapOfDocumentedUnknownTypeAsync(
        Dictionary<string, object?> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Tests that dynamic snippets include all required properties in the
    /// object initializer, even when the example omits some required fields.
    /// </summary>
    WithRawResponseTask<TypesObjectWithMixedRequiredAndOptionalFields> EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
        TypesObjectWithMixedRequiredAndOptionalFields request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Tests that dynamic snippets recursively construct default objects for
    /// required properties whose type is a named object. When the example
    /// omits the nested object, the generator should construct a default
    /// initializer with the nested object's required properties filled in.
    /// </summary>
    WithRawResponseTask<TypesObjectWithRequiredNestedObject> EndpointsObjectGetAndReturnWithRequiredNestedObjectAsync(
        TypesObjectWithRequiredNestedObject request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    /// </summary>
    WithRawResponseTask<TypesObjectWithDatetimeLikeString> EndpointsObjectGetAndReturnWithDatetimeLikeStringAsync(
        TypesObjectWithDatetimeLikeString request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
