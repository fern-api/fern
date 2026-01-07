namespace SeedObjectsWithImports;

public partial interface IOptionalClient
{
    Task<string> SendOptionalBodyAsync(
        Dictionary<string, object?>? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<string> SendOptionalTypedBodyAsync(
        SendOptionalBodyRequest? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Tests optional(nullable(T)) where T has only optional properties.
    /// This should not generate wire tests expecting {} when Optional.empty() is passed.
    /// </summary>
    Task<DeployResponse> SendOptionalNullableWithAllOptionalPropertiesAsync(
        string actionId,
        string id,
        DeployParams? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
