using SeedExamples.Core;

namespace SeedExamples.File_.Notification;

public partial class NotificationClient : INotificationClient
{
    private RawClient _client;

    internal NotificationClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ServiceClient Service { get; }

    public NotificationClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
