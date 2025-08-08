namespace SeedExamples.File;

public partial class FileClient
{
    private SeedExamples.Core.RawClient _client;

    internal FileClient(SeedExamples.Core.RawClient client)
    {
        _client = client;
        Notification = new SeedExamples.File.Notification.NotificationClient(_client);
        Service = new SeedExamples.File.ServiceClient(_client);
    }

    public SeedExamples.File.Notification.NotificationClient Notification { get; }

    public SeedExamples.File.ServiceClient Service { get; }
}
