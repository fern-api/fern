namespace SeedObjectsWithImports;

public partial interface IOptionalClient
{
    WithRawResponseTask<string> SendOptionalBodyAsync(
        object? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> SendOptionalTypedBodyAsync(
        SendOptionalBodyRequest? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Tests optional(nullable(T)) where T has only optional properties.
    /// This should not generate wire tests expecting {} when Optional.empty() is passed.
    /// </summary>
    WithRawResponseTask<DeployResponse> SendOptionalNullableWithAllOptionalPropertiesAsync(
        string actionId,
        string id,
        DeployParams? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
