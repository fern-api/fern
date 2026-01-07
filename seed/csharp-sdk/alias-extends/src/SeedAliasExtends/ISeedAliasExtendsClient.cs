namespace SeedAliasExtends;

public partial interface ISeedAliasExtendsClient
{
    Task ExtendedInlineRequestBodyAsync(
        InlinedChildRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
