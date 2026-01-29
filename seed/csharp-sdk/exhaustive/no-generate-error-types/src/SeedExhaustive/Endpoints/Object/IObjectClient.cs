using SeedExhaustive;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial interface IObjectClient
{
    WithRawResponseTask<ObjectWithOptionalField> GetAndReturnWithOptionalFieldAsync(
        ObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ObjectWithRequiredField> GetAndReturnWithRequiredFieldAsync(
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ObjectWithMapOfMap> GetAndReturnWithMapOfMapAsync(
        ObjectWithMapOfMap request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<NestedObjectWithOptionalField> GetAndReturnNestedWithOptionalFieldAsync(
        NestedObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsync(
        string string_,
        NestedObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsListAsync(
        IEnumerable<NestedObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    /// </summary>
    WithRawResponseTask<ObjectWithDatetimeLikeString> GetAndReturnWithDatetimeLikeStringAsync(
        ObjectWithDatetimeLikeString request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
