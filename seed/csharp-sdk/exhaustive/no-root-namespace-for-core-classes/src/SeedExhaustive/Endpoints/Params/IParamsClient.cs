using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial interface IParamsClient
{
    /// <summary>
    /// GET with path param
    /// </summary>
    Task<string> GetWithPathAsync(
        string param,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path param
    /// </summary>
    Task<string> GetWithInlinePathAsync(
        GetWithInlinePath request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with query param
    /// </summary>
    Task GetWithQueryAsync(
        GetWithQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with multiple of same query param
    /// </summary>
    Task GetWithAllowMultipleQueryAsync(
        GetWithMultipleQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path and query params
    /// </summary>
    Task GetWithPathAndQueryAsync(
        string param,
        GetWithPathAndQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path and query params
    /// </summary>
    Task GetWithInlinePathAndQueryAsync(
        GetWithInlinePathAndQuery request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    Task<string> ModifyWithPathAsync(
        string param,
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    Task<string> ModifyWithInlinePathAsync(
        ModifyResourceAtInlinedPath request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
