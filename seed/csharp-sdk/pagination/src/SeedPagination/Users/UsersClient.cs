using SeedPagination;

namespace SeedPagination;

public class UsersClient
{
    private RawClient _client;

    public UsersClient(RawClient client)
    {
        _client = client;
    }

    public async void ListWithCursorPaginationAsync() { }

    public async void ListWithOffsetPaginationAsync() { }

    public async void ListWithExtendedResultsAsync() { }

    public async void ListUsernamesAsync() { }

    public async void ListWithGlobalConfigAsync() { }
}
