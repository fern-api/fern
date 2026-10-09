namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<AstNode> CreateAstAsync(
        AstNode request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
