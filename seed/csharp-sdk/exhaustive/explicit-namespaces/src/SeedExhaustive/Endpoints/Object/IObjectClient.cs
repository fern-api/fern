using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Endpoints.Object;

public partial interface IObjectClient
{
    Task<ObjectWithOptionalField> GetAndReturnWithOptionalFieldAsync(
        ObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<ObjectWithRequiredField> GetAndReturnWithRequiredFieldAsync(
        ObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<ObjectWithMapOfMap> GetAndReturnWithMapOfMapAsync(
        ObjectWithMapOfMap request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<NestedObjectWithOptionalField> GetAndReturnNestedWithOptionalFieldAsync(
        NestedObjectWithOptionalField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsync(
        string string_,
        NestedObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsListAsync(
        IEnumerable<NestedObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
