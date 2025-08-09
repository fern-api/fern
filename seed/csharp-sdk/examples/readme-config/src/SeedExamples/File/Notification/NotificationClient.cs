using SeedExamples.Core;

namespace SeedExamples.File.Notification;

public partial class NotificationClient
{
    private RawClient _client;

    internal NotificationClient(RawClient client)
    {
        _client = client;
        Service = new SeedExamples.File.Notification.ServiceClient(_client);
    }

    public SeedExamples.File.Notification.ServiceClient Service { get; }
}
