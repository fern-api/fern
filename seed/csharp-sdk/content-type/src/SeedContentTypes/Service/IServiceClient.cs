namespace SeedContentTypes;

public partial interface IServiceClient
{
    WithRawResponseTask PatchAsync(
        PatchProxyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Update with JSON merge patch - complex types.
    /// This endpoint demonstrates the distinction between:
    /// - optional&lt;T&gt; fields (can be present or absent, but not null)
    /// - optional&lt;nullable&lt;T&gt;&gt; fields (can be present, absent, or null)
    /// </summary>
    WithRawResponseTask PatchComplexAsync(
        string id,
        PatchComplexRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Named request with mixed optional/nullable fields and merge-patch content type.
    /// This should trigger the NPE issue when optional fields aren't initialized.
    /// </summary>
    WithRawResponseTask NamedPatchWithMixedAsync(
        string id,
        NamedMixedPatchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
    /// This endpoint should:
    /// 1. Not NPE when fields are not provided (tests initialization)
    /// 2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
    /// </summary>
    WithRawResponseTask OptionalMergePatchTestAsync(
        OptionalMergePatchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Regular PATCH endpoint without merge-patch semantics
    /// </summary>
    WithRawResponseTask RegularPatchAsync(
        string id,
        RegularPatchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
