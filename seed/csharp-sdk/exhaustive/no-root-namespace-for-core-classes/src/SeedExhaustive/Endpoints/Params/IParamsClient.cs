using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial interface IParamsClient
{
    /// <summary>
    /// GET with path param
    /// </summary>
    WithRawResponseTask<string> GetWithPathAsync(
        string param,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path param
    /// </summary>
    WithRawResponseTask<string> GetWithInlinePathAsync(
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
    WithRawResponseTask<string> ModifyWithPathAsync(
        string param,
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// PUT to update with path param
    /// </summary>
    WithRawResponseTask<string> ModifyWithInlinePathAsync(
        ModifyResourceAtInlinedPath request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// POST bytes with path param returning object
    /// </summary>
    WithRawResponseTask<ObjectWithRequiredField> UploadWithPathAsync(
        string param,
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with boolean path param
    /// </summary>
    WithRawResponseTask<string> GetWithBooleanPathAsync(
        bool param,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// GET with path param that can throw errors
    /// </summary>
    WithRawResponseTask<string> GetWithPathAndErrorsAsync(
        string param,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
