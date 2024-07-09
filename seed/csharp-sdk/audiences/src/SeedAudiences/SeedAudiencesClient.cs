using SeedAudiences;
using SeedAudiences.Core;
using SeedAudiences.FolderA;
using SeedAudiences.FolderB;
using SeedAudiences.FolderC;

#nullable enable

namespace SeedAudiences;

public partial class SeedAudiencesClient
{
    private RawClient _client;

    public SeedAudiencesClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Commons = new CommonsClient(_client);
        FolderA = new FolderAClient(_client);
        FolderB = new FolderBClient(_client);
        FolderC = new FolderCClient(_client);
        Foo = new FooClient(_client);
    }

    public CommonsClient Commons { get; }

    public FolderAClient FolderA { get; }

    public FolderBClient FolderB { get; }

    public FolderCClient FolderC { get; }

    public FooClient Foo { get; }
}
