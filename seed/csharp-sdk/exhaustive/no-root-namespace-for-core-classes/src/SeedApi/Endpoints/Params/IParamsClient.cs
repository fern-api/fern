using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

public partial interface IParamsClient
{
    /// <summary>
    /// GET with path param
    /// </summary>
    WithRawResponseTask<string> GetWithPathAsync(
        GetWithPathParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// POST bytes with path param returning object
    /// </summary>
    WithRawResponseTask<TypesObjectWithRequiredField> UploadWithPathAsync(
        string param,
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    WithRawResponseTask<string> ModifyWithPathAsync(
        ModifyWithPathParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path param
    /// </summary>
    WithRawResponseTask<string> GetWithInlinePathAsync(
        GetWithInlinePathParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    WithRawResponseTask<string> ModifyWithInlinePathAsync(
        ModifyWithInlinePathParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with query param
    /// </summary>
    Task GetWithQueryAsync(
        GetWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    Task GetWithAllowMultipleQueryAsync(
        GetWithAllowMultipleQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path and query params
    /// </summary>
    Task GetWithPathAndQueryAsync(
        GetWithPathAndQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path and query params
    /// </summary>
    Task GetWithInlinePathAndQueryAsync(
        GetWithInlinePathAndQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
