using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

public partial class InlineUsersClient
{
    private RawClient _client;

    internal InlineUsersClient(RawClient client)
    {
        _client = client;
        InlineUsers = new InlineUsersClient(_client);
    }

    public InlineUsersClient InlineUsers { get; }
}
