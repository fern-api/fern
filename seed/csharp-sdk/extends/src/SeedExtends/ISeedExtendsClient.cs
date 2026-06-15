namespace SeedExtends;

public partial interface ISeedExtendsClient
{
    WithRawResponseTask ExtendedInlineRequestBodyAsync(
        Inlined request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
