namespace SeedExtends;

public partial interface ISeedExtendsClient
{
    Task ExtendedInlineRequestBodyAsync(
        Inlined request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
