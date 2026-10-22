using SeedApi.Core;

namespace SeedApi.Messages;

public partial class MessagesClient : IMessagesClient
{
    private readonly RawClient _client;

    internal MessagesClient(RawClient client)
    {
        _client = client;
        Messages = new MessagesClient_(_client);
    }

    public IMessagesClient_ Messages { get; }
}
