namespace SeedAlias;

public partial interface ISeedAliasClient
{
    WithRawResponseTask GetAsync(
        string typeId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
