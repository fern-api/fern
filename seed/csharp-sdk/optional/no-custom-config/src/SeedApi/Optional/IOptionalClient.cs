namespace SeedApi;

public partial interface IOptionalClient
{
    WithRawResponseTask<string> SendoptionalbodyAsync(
        Dictionary<string, object?>? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> SendoptionaltypedbodyAsync(
        SendOptionalBodyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Tests optional(nullable(T)) where T has only optional properties.
    /// This should not generate wire tests expecting {} when Optional.empty() is passed.
    /// </summary>
    WithRawResponseTask<DeployResponse> SendoptionalnullablewithalloptionalpropertiesAsync(
        DeployParams request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
