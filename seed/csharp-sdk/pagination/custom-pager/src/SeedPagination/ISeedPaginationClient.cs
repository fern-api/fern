using SeedPagination.InlineUsers;

namespace SeedPagination;

public partial interface ISeedPaginationClient
{
    public IComplexClient Complex { get; }
    public IInlineUsersClient InlineUsers { get; }
    public IUsersClient Users { get; }
}
