using SeedPaginationUriPath.Core;

namespace SeedPaginationUriPath;

public partial class UsersClient : IUsersClient
{
    private readonly RawClient _client;

    internal UsersClient(RawClient client)
    {
        _client = client;
    }
}
