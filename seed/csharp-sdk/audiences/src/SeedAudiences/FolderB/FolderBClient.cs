using SeedAudiences;
using SeedAudiences.FolderB;

namespace SeedAudiences.FolderB;

public class FolderBClient
{
    private RawClient _client;

    public FolderBClient(RawClient client)
    {
        _client = client;
        Common = new CommonClient(_client);
    }

    public CommonClient Common { get; }
}
