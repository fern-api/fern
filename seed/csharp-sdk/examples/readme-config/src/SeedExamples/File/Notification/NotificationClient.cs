namespace SeedExamples.File.Notification;

public partial class NotificationClient
{
    private SeedExamples.Core.RawClient _client;

    internal NotificationClient(SeedExamples.Core.RawClient client)
    {
        _client = client;
        Service = new SeedExamples.File.Notification.ServiceClient(_client);
    }

    public SeedExamples.File.Notification.ServiceClient Service { get; }
}
