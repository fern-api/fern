using SeedAudiences.Core;

namespace SeedAudiences.FolderA;

public partial class FolderAClient : IFolderAClient
{
    private RawClient _client;

    internal FolderAClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ServiceClient Service { get; }

    public FolderAClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
