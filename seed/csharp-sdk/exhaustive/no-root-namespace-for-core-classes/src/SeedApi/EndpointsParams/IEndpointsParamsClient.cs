using SeedApi.Core;

namespace SeedApi;

public partial interface IEndpointsParamsClient
{
    /// <summary>
    /// GET with path param
    /// </summary>
    WithRawResponseTask<string> EndpointsParamsGetWithPathAsync(
        EndpointsParamsGetWithPathRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// POST bytes with path param returning object
    /// </summary>
    WithRawResponseTask<TypesObjectWithRequiredField> EndpointsParamsUploadWithPathAsync(
        string param,
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    WithRawResponseTask<string> EndpointsParamsModifyWithPathAsync(
        EndpointsParamsModifyWithPathRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path param
    /// </summary>
    WithRawResponseTask<string> EndpointsParamsGetWithInlinePathAsync(
        EndpointsParamsGetWithInlinePathRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    WithRawResponseTask<string> EndpointsParamsModifyWithInlinePathAsync(
        EndpointsParamsModifyWithInlinePathRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with query param
    /// </summary>
    Task EndpointsParamsGetWithQueryAsync(
        EndpointsParamsGetWithQueryRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    Task EndpointsParamsGetWithAllowMultipleQueryAsync(
        EndpointsParamsGetWithAllowMultipleQueryRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path and query params
    /// </summary>
    Task EndpointsParamsGetWithPathAndQueryAsync(
        EndpointsParamsGetWithPathAndQueryRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path and query params
    /// </summary>
    Task EndpointsParamsGetWithInlinePathAndQueryAsync(
        EndpointsParamsGetWithInlinePathAndQueryRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with boolean path param
    /// </summary>
    WithRawResponseTask<string> EndpointsParamsGetWithBooleanPathAsync(
        EndpointsParamsGetWithBooleanPathRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path param that can throw errors
    /// </summary>
    WithRawResponseTask<string> EndpointsParamsGetWithPathAndErrorsAsync(
        EndpointsParamsGetWithPathAndErrorsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
