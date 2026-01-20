using SeedAudiences.Core;

namespace SeedAudiences.FolderD;

public partial class FolderDClient : IFolderDClient
{
    private RawClient _client;

    internal FolderDClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ServiceClient Service { get; }

    public FolderDClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
