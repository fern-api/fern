using SeedPagination.Core;

namespace SeedPagination;

public partial interface IComplexClient
{
    Task<Pager<Conversation>> SearchAsync(
        string index,
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
