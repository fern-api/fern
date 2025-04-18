using SeedExamples.Core;
using SeedExamples.File.Notification;

namespace SeedExamples.File;

public partial class FileClient
{
    private RawClient _client;

    internal FileClient(RawClient client)
    {
        _client = client;
        Notification = new NotificationClient(_client);
        Service = new ServiceClient(_client);
    }

    public NotificationClient Notification { get; }

    public ServiceClient Service { get; }
}
