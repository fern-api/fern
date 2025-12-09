using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

public partial class InlineUsersClient
{
    private RawClient _client;

    internal InlineUsersClient(RawClient client)
    {
        try
        {
            _client = client;
            InlineUsers = new InlineUsersClient_(_client);
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public InlineUsersClient_ InlineUsers { get; }
}
