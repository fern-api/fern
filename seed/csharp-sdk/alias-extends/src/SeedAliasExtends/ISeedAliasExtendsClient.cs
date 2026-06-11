namespace SeedAliasExtends;

public partial interface ISeedAliasExtendsClient
{
    WithRawResponseTask ExtendedInlineRequestBodyAsync(
        InlinedChildRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
