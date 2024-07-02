using SeedExamples.Core;
using SeedExamples.File;
using SeedExamples.File.Notification;

#nullable enable

namespace SeedExamples.File;

public class FileClient
{
    private RawClient _client;

    public FileClient(RawClient client)
    {
        _client = client;
        Notification = new NotificationClient(_client);
        Service = new ServiceClient(_client);
    }

    public NotificationClient Notification { get; }

    public ServiceClient Service { get; }
}
