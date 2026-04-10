using OneOf;
using SeedApi;

namespace SeedApi.EndpointsContainer;

public partial interface IEndpointsContainerClient
{
    WithRawResponseTask<IEnumerable<string>> EndpointsContainerGetAndReturnListOfPrimitivesAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<
        IEnumerable<TypesObjectWithRequiredField>
    > EndpointsContainerGetAndReturnListOfObjectsAsync(
        IEnumerable<TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<string>> EndpointsContainerGetAndReturnSetOfPrimitivesAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<
        IEnumerable<TypesObjectWithRequiredField>
    > EndpointsContainerGetAndReturnSetOfObjectsAsync(
        IEnumerable<TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<
        Dictionary<string, string>
    > EndpointsContainerGetAndReturnMapPrimToPrimAsync(
        Dictionary<string, string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<
        Dictionary<string, TypesObjectWithRequiredField>
    > EndpointsContainerGetAndReturnMapOfPrimToObjectAsync(
        Dictionary<string, TypesObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<
        Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>
    > EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
        Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<TypesObjectWithRequiredField> EndpointsContainerGetAndReturnOptionalAsync(
        TypesObjectWithRequiredField request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
