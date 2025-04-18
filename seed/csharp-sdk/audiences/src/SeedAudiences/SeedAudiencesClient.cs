using SeedAudiences.Core;
using SeedAudiences.FolderA;
using SeedAudiences.FolderB;
using SeedAudiences.FolderC;
using SeedAudiences.FolderD;

namespace SeedAudiences;

public partial class SeedAudiencesClient
{
    private readonly RawClient _client;

    public SeedAudiencesClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedAudiences" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernaudiences/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Commons = new CommonsClient(_client);
        FolderA = new FolderAClient(_client);
        FolderB = new FolderBClient(_client);
        FolderC = new FolderCClient(_client);
        FolderD = new FolderDClient(_client);
        Foo = new FooClient(_client);
    }

    public CommonsClient Commons { get; }

    public FolderAClient FolderA { get; }

    public FolderBClient FolderB { get; }

    public FolderCClient FolderC { get; }

    public FolderDClient FolderD { get; }

    public FooClient Foo { get; }
}
