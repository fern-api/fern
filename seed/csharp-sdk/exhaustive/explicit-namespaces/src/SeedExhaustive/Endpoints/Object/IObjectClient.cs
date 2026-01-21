using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.Object;

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
}
