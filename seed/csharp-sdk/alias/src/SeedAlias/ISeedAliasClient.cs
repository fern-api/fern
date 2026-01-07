namespace SeedAlias;

public partial interface ISeedAliasClient
{
    Task GetAsync(
        string typeId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
