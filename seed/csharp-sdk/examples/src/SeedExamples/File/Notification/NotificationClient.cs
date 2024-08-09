using SeedExamples.Core;

#nullable enable

namespace SeedExamples.File.Notification;

public class NotificationClient
{
    private RawClient _client;

    public NotificationClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
