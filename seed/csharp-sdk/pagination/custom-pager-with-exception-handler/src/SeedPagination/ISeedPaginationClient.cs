using SeedPagination.InlineUsers;

namespace SeedPagination;

public partial interface ISeedPaginationClient
{
    public ComplexClient Complex { get; }
    public InlineUsersClient InlineUsers { get; }
    public UsersClient Users { get; }
}
