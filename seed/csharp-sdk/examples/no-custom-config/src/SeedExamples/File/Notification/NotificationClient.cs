using SeedExamples.Core;

namespace SeedExamples.File.Notification;

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
