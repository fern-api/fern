using SeedExamples.Core;
using SeedExamples.File_.Notification;

namespace SeedExamples.File_;

public partial class FileClient : IFileClient
{
    private RawClient _client;

    internal FileClient(RawClient client)
    {
        _client = client;
        Notification = new NotificationClient(_client);
        Service = new ServiceClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public NotificationClient Notification { get; }

    public ServiceClient Service { get; }

    public FileClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
