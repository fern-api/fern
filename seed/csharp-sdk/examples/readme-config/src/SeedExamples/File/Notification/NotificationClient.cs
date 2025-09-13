using SeedExamples.Core;
using SeedExamples.File_.Notification;

namespace SeedExamples.File_.Notification;

public partial class NotificationClient
{
    private RawClient _client;

    internal NotificationClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
