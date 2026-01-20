using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

public partial class InlineUsersClient : IInlineUsersClient
{
    private RawClient _client;

    internal InlineUsersClient(RawClient client)
    {
        _client = client;
        InlineUsers = new InlineUsersClient_(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public InlineUsersClient_ InlineUsers { get; }

    public InlineUsersClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
